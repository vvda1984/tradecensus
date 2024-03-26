using NLog;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading;
using TradeCensus.Data;

namespace TradeCensus
{
    public class NotificationService
    {
        static NotificationService _instance = null;
        public static NotificationService Instance => _instance;

        public static void Start()
        {
            _instance = new NotificationService();
            _instance.StartThread();
        }


        readonly ILogger _logger;
        readonly ServiceDataContext DC;
        readonly object _locker = new object();
        readonly Queue<NotificationWob> _queue = new Queue<NotificationWob>();
        readonly AutoResetEvent _reset = new AutoResetEvent(false);
        Thread _thread;
        bool _isDisposed = false;
        public int QueueCount { get { lock (_locker) return _queue.Count; } }

        public NotificationService()
        {
            DC = new ServiceDataContext();
            _logger = DependencyResolver.Resolve<ILogFactory>().GetLogger("Notification");
        }

        public void StartThread()
        {
            _thread = new Thread(new ThreadStart(Process));
            _thread.Start();
        }

        public void Enqueue(NotificationWob wob)
        {
            lock (_locker)
                _queue.Enqueue(wob);
            _reset.Set();
        }

        private NotificationWob Dequeue()
        {
            try
            {
                lock (_locker)
                    return _queue.Count > 0 ? _queue.Dequeue() : null;
            }
            catch
            {
                return null;
            }
        }

        private void Process()
        {
            while (!_isDisposed)
            {
                var wob = Dequeue();
                if (wob == null)
                {
                    Thread.Sleep(1000);
                    wob = Dequeue();
                }
                if (wob == null)
                {
                    _logger.Debug($"No more message, put notification service to sleep");
                    _reset.WaitOne();
                }
                else
                    ProcessWob(wob);
            }
        }

        private void ProcessWob(NotificationWob notificationWob)
        {
            if (notificationWob is NotificationPersonWob)
            {
                var wob = notificationWob as NotificationPersonWob;
                var outletPerson = DC.GetPerson(wob.Outlet.PersonID.ToString());
                wob.OutletPerson = outletPerson;

                if (wob.AuditStatus == Constants.StatusAuditDeny)
                {
                    // Reject --> Send email to SS or DSM                                        
                    if (outletPerson != null && !string.IsNullOrWhiteSpace(outletPerson.Email))
                    {
                        wob.Recipient = outletPerson;
                        SendEmail(wob, "new_outlet_reject", outletPerson.Email);
                    }
                    if (!wob.Person.IsAuditorSS)
                    {
                        // AMS reject Send email to SS
                        var persons = DC.GetPersonSS().Where(x => !string.IsNullOrWhiteSpace(x.Email));
                        if (persons.Any())
                        {
                            foreach (var p in persons)
                            {
                                wob.Recipient = p;
                                SendEmail(wob, "new_outlet_reject", p.Email);
                            }
                        }
                    }
                }
                else if (wob.AuditStatus == Constants.StatusAuditAccept && wob.Person != null)
                {
                    if (wob.Person.IsAuditorSS)
                    {
                        // SS Approve --> Send email to ASM
                        var persons = DC.GetPersonASM().Where(x => !string.IsNullOrWhiteSpace(x.Email));
                        if (persons.Any())
                        {
                            foreach (var p in persons)
                            {
                                wob.Recipient = p;
                                SendEmail(wob, "new_outlet_asm", p.Email);
                            }
                        }
                    }
                    else
                    {
                        // AMS approve Send email to SS or DSM                        
                        if (outletPerson != null && !string.IsNullOrWhiteSpace(outletPerson.Email))
                        {
                            wob.Recipient = outletPerson;
                            SendEmail(wob, "new_outlet_approve", outletPerson.Email);
                        }

                        // AMS approve Send email to SS
                        var persons = DC.GetPersonSS().Where(x => !string.IsNullOrWhiteSpace(x.Email));
                        if (persons.Any())
                        {
                            foreach (var p in persons)
                            {
                                wob.Recipient = p;
                                SendEmail(wob, "new_outlet_approve", p.Email);
                            }
                        }
                    }
                }
                else if (wob.AuditStatus == Constants.StatusPost)
                {
                    // SR/DSM Post new outlet --> Email to SS
                    var persons = DC.GetPersonSS().Where(x => !string.IsNullOrWhiteSpace(x.Email));
                    if (persons.Any())
                    {
                        foreach (var p in persons)
                        {
                            wob.Recipient = p;
                            SendEmail(wob, "new_outlet_ss", p.Email);
                        }
                    }
                }
            }
            else if (notificationWob is NoficiationAdhocWob)
            {
                var wob = notificationWob as NoficiationAdhocWob;
                var email = wob.Email;

                if (string.IsNullOrWhiteSpace(email) || email == "na")
                {
                    var person = DC.GetPersonRoleDetailById(wob.PersonID);
                    email = person.Email;
                }
                if (!string.IsNullOrWhiteSpace(email) && email != "na")
                {
                    if (wob.AuditStatus == Constants.StatusAuditDeny)
                    {
                        SendEmail(wob, "new_outlet_reject", email);
                    }
                    else if (wob.AuditStatus == Constants.StatusAuditAccept)
                    {
                        SendEmail(wob, "new_outlet_asm", email);
                    }
                    else if (wob.AuditStatus == Constants.StatusPost)
                    {
                        SendEmail(wob, "new_outlet_ss", email);
                    }
                }
            }
        }

        private void PopulateReplacement(Dictionary<string, string> dict, object o, string prefix)
        {
            if (o == null) return;
            var props1 = o.GetType().GetProperties().Where(x => x.CanRead);
            foreach (var prop in props1)
            {
                try
                {
                    var v = prop.GetValue(o, null);
                    var value = v == null ? "" : v.ToString();
                    var key = !string.IsNullOrWhiteSpace(prefix) ? $"{prefix}_{prop.Name}" : prop.Name;
                    if (dict.ContainsKey(key))
                    {
                        if (!string.IsNullOrWhiteSpace(value)) dict[key] = value;
                    }
                    else
                    {
                        dict.Add(key, value);
                    }
                }
                catch
                {
                    // do nothing
                }
            }
        }

        private void SendEmail(NotificationWob wob, string category, string recipientEmail)
        {
            try
            {
                var configs = DC.GetServerConfig();

                var subject = configs.Find(x => string.Equals(x.Name, $"email_subject_{category}", StringComparison.OrdinalIgnoreCase));
                var body = configs.Find(x => string.Equals(x.Name, $"email_body_{category}", StringComparison.OrdinalIgnoreCase));

                if (subject == null || body == null) return; // not setup
                var subjectText = new StringBuilder(subject.Value);
                var bodyText = new StringBuilder(body.Value);

                var dict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

                PopulateReplacement(dict, wob.Outlet, null);
                PopulateReplacement(dict, wob.DbOutlet, null);
                PopulateReplacement(dict, wob.Person, "p_");
                PopulateReplacement(dict, wob.Recipient, "r_");
                PopulateReplacement(dict, wob.OutletPerson, "o_");

                foreach (var kvp in dict)
                {
                    try
                    {
                        subjectText = subjectText.Replace("{" + kvp.Key + "}", kvp.Value);
                        bodyText = bodyText.Replace("{" + kvp.Key + "}", kvp.Value);
                    }
                    catch
                    {
                        // do nothing
                    }
                }

                var emailProvider = configs.Find(x => string.Equals(x.Name, "email_provider", StringComparison.OrdinalIgnoreCase));
                if (emailProvider == null || string.Equals(emailProvider.Value, "default", StringComparison.OrdinalIgnoreCase))
                {
                    var host = configs.Find(x => string.Equals(x.Name, "email_host", StringComparison.OrdinalIgnoreCase));
                    var port = configs.Find(x => string.Equals(x.Name, "email_port", StringComparison.OrdinalIgnoreCase));
                    var username = configs.Find(x => string.Equals(x.Name, "email_username", StringComparison.OrdinalIgnoreCase));
                    var password = configs.Find(x => string.Equals(x.Name, "emai_password", StringComparison.OrdinalIgnoreCase));
                    var enableSsl = configs.Find(x => string.Equals(x.Name, "email_enable_ssl", StringComparison.OrdinalIgnoreCase));
                    var senderEmail = configs.Find(x => string.Equals(x.Name, "email_sender_email", StringComparison.OrdinalIgnoreCase));
                    var senderName = configs.Find(x => string.Equals(x.Name, "email_sender_name", StringComparison.OrdinalIgnoreCase));
                    var bcc = configs.Find(x => string.Equals(x.Name, "email_bcc", StringComparison.OrdinalIgnoreCase));
                    var cc = configs.Find(x => string.Equals(x.Name, "email_cc", StringComparison.OrdinalIgnoreCase));

                    var email = new MailMessage
                    {
                        Subject = subjectText.ToString(),
                        Body = bodyText.ToString(),
                        IsBodyHtml = true,
                        From = senderName == null || string.IsNullOrEmpty(senderName.Value)
                            ? new MailAddress(senderEmail.Value)
                            : new MailAddress(senderEmail.Value, senderName.Value),
                    };
                    email.To.Add(recipientEmail);
                    if (bcc != null && !string.IsNullOrWhiteSpace(bcc.Value))
                    {
                        var emails = bcc.Value.Split(new[] { "," }, StringSplitOptions.RemoveEmptyEntries);
                        foreach (var m in emails)
                            email.Bcc.Add(m.Trim());
                    }
                    if (cc != null && !string.IsNullOrWhiteSpace(cc.Value))
                    {
                        var emails = cc.Value.Split(new[] { "," }, StringSplitOptions.RemoveEmptyEntries);
                        foreach (var m in emails)
                            email.CC.Add(m.Trim());
                    }

                    using (var smtp = new SmtpClient(host.Value, int.Parse(port.Value)))
                    {
                        if (!string.IsNullOrWhiteSpace(username.Value) && !string.IsNullOrWhiteSpace(password.Value))
                        {
                            smtp.Credentials = new NetworkCredential(username.Value, password.Value);
                        }
                        if (enableSsl != null && enableSsl.Value == "1")
                            smtp.EnableSsl = true;

                        smtp.Send(email);
                        _logger.Info($"Sent email to {host?.Value}:{port?.Value} {recipientEmail} ({category})");
                    }
                }
                else if (string.Equals(emailProvider.Value, "database", StringComparison.OrdinalIgnoreCase))
                {
                    var spname = configs.Find(x => string.Equals(x.Name, "email_sp_name", StringComparison.OrdinalIgnoreCase));
                    var recipients = new List<string> { recipientEmail };
                    var cc = configs.Find(x => string.Equals(x.Name, "email_cc", StringComparison.OrdinalIgnoreCase));
                    if (cc != null && !string.IsNullOrWhiteSpace(cc.Value))
                    {
                        var emails = cc.Value.Split(new[] { "," }, StringSplitOptions.RemoveEmptyEntries);
                        foreach (var m in emails)
                            recipients.Add(m.Trim());
                    }
                    var dbConn = DC.EntityDb.Database.Connection;
                    if (dbConn.State != System.Data.ConnectionState.Open) dbConn.Open();
                    var command = new SqlCommand
                    {
                        CommandType = System.Data.CommandType.StoredProcedure,
                        CommandText = spname?.Value ?? "msdb.dbo.sp_send_dbmail",
                        Connection = dbConn as SqlConnection
                    };
                    //var "profile_name"
                    var senderEmail = configs.Find(x => string.Equals(x.Name, "email_sender_email", StringComparison.OrdinalIgnoreCase));
                    var profileName = configs.Find(x => string.Equals(x.Name, "email_profile_name", StringComparison.OrdinalIgnoreCase));

                    if (profileName != null && !string.IsNullOrWhiteSpace(profileName.Value))
                    {
                        command.Parameters.Add(new SqlParameter("profile_name ", profileName.Value));
                    }
                    if (senderEmail != null && !string.IsNullOrWhiteSpace(senderEmail.Value))
                    {
                        command.Parameters.Add(new SqlParameter("from_address", senderEmail.Value));
                    }
                    command.Parameters.Add(new SqlParameter("recipients", string.Join(";", recipients)));
                    command.Parameters.Add(new SqlParameter("subject", subjectText.ToString()));
                    command.Parameters.Add(new SqlParameter("body", bodyText.ToString()));
                    command.Parameters.Add(new SqlParameter("body_format", "HTML"));
                    command.ExecuteNonQuery();

                    _logger.Info($"Sent email to {profileName?.Value} {recipientEmail} ({category})");
                }
            }
            catch (Exception ex)
            {
                _logger.Error($"Cannot send email: {ex}", ex);
            }
        }

        public void Stop()
        {
            _isDisposed = true;
            _reset.Set();
        }
    }
}