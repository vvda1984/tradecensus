using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Runtime.InteropServices;
using System.Threading;
using System.Web;
using System.Web.UI.WebControls;
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
                    _reset.WaitOne();
                else
                    ProcessWob(wob);
            }
        }

        private void ProcessWob(NotificationWob wob)
        {
            if (wob.AuditStatus == Constants.StatusAuditDeny)
            {
                // Reject --> Send email to SS or DSM
                var outletPerson = DC.GetPerson((wob.Outlet.PersonID).ToString());
                if (outletPerson != null && !string.IsNullOrWhiteSpace(outletPerson.Email))
                {
                    SendEmail(wob, "new_outlet_reject", outletPerson);
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
                            SendEmail(wob, "new_outlet_asm", p);
                        }
                    }
                }
                else
                {
                    // AMS approve Send email to SS or DSM
                    var outletPerson = DC.GetPerson((wob.Outlet.PersonID).ToString());
                    if (outletPerson != null && !string.IsNullOrWhiteSpace(outletPerson.Email))
                    {
                        SendEmail(wob, "new_outlet_approve", outletPerson);
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

                        SendEmail(wob, "new_outlet_ss", p);
                    }
                }
            }

        }

        private void SendEmail(NotificationWob wob, string category, Person person)
        {
            try
            {
                var configs = DC.GetServerConfig();

                var subject = configs.Find(x => string.Equals(x.Name, $"email_subject_{category}", StringComparison.OrdinalIgnoreCase));
                var body = configs.Find(x => string.Equals(x.Name, $"email_body_{category}", StringComparison.OrdinalIgnoreCase));

                if (subject == null || body == null) return; // not setup
                var subjectText = subject.Value;
                var bodyText = body.Value;
                if (wob.Outlet != null)
                {
                    var props1 = wob.Outlet.GetType().GetProperties().Where(x => x.CanRead);
                    foreach (var prop in props1)
                    {
                        try
                        {
                            var v = prop.GetValue(wob.Outlet, null);
                            subjectText = subjectText.Replace("{" + prop.Name + "}", v == null ? "" : v.ToString());
                            subjectText = bodyText.Replace("{" + prop.Name + "}", v == null ? "" : v.ToString());
                        }
                        catch
                        {
                            // do nothing
                        }
                    }
                }
                if (wob.Person != null)
                {
                    var props2 = wob.Person.GetType().GetProperties().Where(x => x.CanRead);
                    foreach (var prop in props2)
                    {
                        try
                        {
                            var v = prop.GetValue(wob.Person, null);
                            subjectText = subjectText.Replace("{" + prop.Name + "}", v == null ? "" : v.ToString());
                            subjectText = bodyText.Replace("{" + prop.Name + "}", v == null ? "" : v.ToString());
                        }
                        catch
                        {
                            // do nothing
                        }
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
                    var cc = configs.Find(x => string.Equals(x.Name, "email_bcc", StringComparison.OrdinalIgnoreCase));

                    var email = new MailMessage
                    {
                        Subject = subjectText,
                        Body = bodyText,
                        Sender = senderName == null || string.IsNullOrEmpty(senderName.Value) ? new MailAddress(senderEmail.Value) : new MailAddress(senderEmail.Value, senderName.Value),
                    };
                    email.To.Add(person.Email);
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
                        smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
                        smtp.Credentials = new NetworkCredential(username.Value, password.Value);
                        if (enableSsl != null && enableSsl.Value == "1")
                            smtp.EnableSsl = true;

                        smtp.Send(email);
                        _logger.Info($"Sent email to {person.Email} ({category})");
                    }
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