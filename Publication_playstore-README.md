[Publier son application sur PlayStore](https://ionicframework.com/docs/v1/guide/publishing.html) 


# Procédure pour publier ou mettre à jour un apk sur PlayStore

1. Modifier ou incrémenter la version dans le fichier config.xml

2. Exécuter les commandes suivantes:

3. $ ionic cordova build android --release

4. $ cd C:\Program Files\Java\jdk1.8.0_152\bin

5. Générer une clé, Signer l'apk avec la clé et archiver.
### Dans le cas d'une nouvelle publication, 
- Générer une nouvelle clé RSA:
    * $ keytool -genkey -v -keystore C:\Users\yawo\Desktop\Lab\ShoppingList\shopping-list-release-key.keystore -alias shopping-list-key -keyalg RSA -keysize 2048 -validity 10000

- Signer l'apk avec la clé générée
    * $ jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore C:\Users\yawo\Desktop\Lab\ShoppingList\shopping-list-release-key.keystore C:\Users\yawo\Desktop\Lab\ShoppingList\platforms\android\build\outputs\apk\android-release-unsigned.apk shopping-list-key

### Sinon dans le cas d'une mise à jour,
- Utiliser la clé préalablement générée pour signer l'apk
    * $ jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore C:\Users\yawo\Desktop\Lab\ShoppingList\shopping-list-release-key.keystore C:\Users\yawo\Desktop\Lab\ShoppingList\platforms\android\build\outputs\apk\android-release-unsigned.apk shopping-list-key

6. Archiver l'apk qu'on vient de signer dans la version appropriée
    * $ cd C:\Users\yawo\AppData\Local\Android\sdk\build-tools\27.0.1
    * $ zipalign -v 4 C:\Users\yawo\Desktop\Lab\ShoppingList\platforms\android\build\outputs\apk\android-release-unsigned.apk C:\Users\yawo\Desktop\Lab\ShoppingList\shopping-list-release-v1.0.[newVersion].apk

# NB: [important]: Dans le cas du shopping list j'ai perdu ma clé et j'ai dû demander un reset de la part de Google qui m'a fait générer une nouvelle clé afin que je puisse mettre à jour mon application.

### Alias Name et clé de ShoppingList: 
alias : upload
key : keystore.jks

$ jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore C:\Users\yawo\Desktop\Lab\ShoppingList\keystore.jks C:\Users\yawo\Desktop\Lab\ShoppingList\platforms\android\build\outputs\apk\android-release-unsigned.apk upload





go to https://play.google.com/apps/publish/?hl=fr&account=7870916947945793059#AppListPlace


# Help : 

### Pour retrouver l'alias name :
$ cd C:\Program Files\Java\jdk1.8.0_152\bin
$ keytool -keystore C:\Users\yawo\Desktop\Lab\parkinglocation\parking-location-release-key.keystore -list -v



