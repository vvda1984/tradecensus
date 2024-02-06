## Folders
- database: database script
- tc.webservice: WCF web service
- tc.mobileclient: Mobile using Visual Studio (obsoluted)
- tradecensus: Mobile using cordova

Signed:
keytool.exe -genkey -v -keystore tradecencus.keystore -alias TradeCensus -keyalg RSA -keysize 2048 -validity 10000

Pass:
Password1000

Bundle:
cordova build android --release 

-- --keystore=C:\AnV\tradecensus\tradecencus.keystore --storePassword=Password1000 --alias=TradeCensus --password=Password1000 --packageType=bundle


https://stackoverflow.com/questions/26449512/how-to-create-a-signed-apk-file-using-cordova-command-line-interface