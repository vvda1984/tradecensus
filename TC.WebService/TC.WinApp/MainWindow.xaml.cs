using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows;
using System.Linq;

namespace TC.WinApp
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        WinLogger _logger;
        Province[] _provinces;
        Task task;
        string[] _dirs;
        int _index = 0;
        

        public MainWindow()
        {
            InitializeComponent();

            textSourceDir.Text = @"D:\AVProj\Mob.TradeCensus\Docs\database_provices";
            textName.Text = "Hồ Chí Minh";
            textStartIndex.Text = "500000";
            textSourceFile.Text = @"D:\AVProj\Mob.TradeCensus\Docs\database_provices\Ho Chi Minh\doc.kml";
            KmlFileParser.DataBuidler = new RawGeoBuilder();

            _logger = new WinLogger(WriteLog);
            try {
                using (test_db_tcEntities _entities = new test_db_tcEntities())
                    _provinces = _entities.Provinces.ToArray();
            }
            catch (Exception ex) {
                MessageBox.Show(ex.ToString());
            }

        }

        public void WriteLog(string msg)
        {
            richText.Dispatcher.Invoke(() =>
            {
                richText.AppendText(msg);
                richText.AppendText(Environment.NewLine);
                richText.ScrollToEnd();
            });
        }

        private void buttonRun_Click(object sender, RoutedEventArgs e)
        {
            //string sourceDir= textSourceFolder.Text;
            //// validate dir...

            //string[] directories = System.IO.Directory.GetDirectories(sourceDir);
            //List<string> kmlFiles = new List<string>();
            //foreach(string dir in directories)
            //{
            //    string[] files = System.IO.Directory.GetFiles(dir, "*.kml");
            //    kmlFiles.AddRange(files);
            //}
            //Parse(kmlFiles.ToArray());

            string name = textName.Text;
            int startIndex = int.Parse(textStartIndex.Text);
            string sourceFile = textSourceFile.Text;

            task = new Task(() =>
            {
                try
                {
                    KmlFileParser parser = new KmlFileParser(name, startIndex, _logger ); //new WinLogger(msg=> { }));
                    parser.Parse(sourceFile);
                }
                catch (Exception ex)
                {
                    this.WriteLog(ex.ToString());
                }
            });
            task.Start();
        }

        public class WinLogger : ILogger
        {
            Action<string> _writeAction;
            public WinLogger(Action<string> write)
            {
                _writeAction = write;
            }
            public void WriteLog(string msg, params object[] args)
            {
                _writeAction(string.Format(msg, args));
            }
        }

        public string convertToUnSign3(string s)
        {
            Regex regex = new Regex("\\p{IsCombiningDiacriticalMarks}+");
            string temp = s.Normalize(NormalizationForm.FormD);
            return regex.Replace(temp, String.Empty).Replace('\u0111', 'd').Replace('\u0110', 'D');
        }

        private void LoadDir()
        {
            if (_index >= _dirs.Length)
            {
                _index = _dirs.Length - 1;
                return;
            }
            else if (_index < 0)
            {
                _index = 0;
                return;
            }

            string dir = _dirs[_index];

            string name = Path.GetFileName(dir);
            textSourceFile.Text = Directory.GetFiles(dir, "*.kml")[0];

            Province province = _provinces.FirstOrDefault(i => string.Compare(convertToUnSign3(i.Name), name, StringComparison.OrdinalIgnoreCase) == 0);
            if (province != null)
            {
                textName.Text = province.Name;
                textStartIndex.Text = province.ID + "0000";
            }
            else
            {
                textName.Text = "";
                textStartIndex.Text = "0000";
            }
        }

        private void buttonLoad_Click(object sender, RoutedEventArgs e)
        {
            _dirs = Directory.GetDirectories(textSourceDir.Text);
            _index = 0;
            LoadDir();
        }

        private void buttonBack_Click(object sender, RoutedEventArgs e)
        {
            _index--;
            LoadDir();
        }

        private void buttonNext_Click(object sender, RoutedEventArgs e)
        {
            _index++;
            LoadDir();
        }
    }

    public interface ILogger
    {
        void WriteLog(string msg, params object[] args);
    }
}
