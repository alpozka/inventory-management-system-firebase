# Inventory Management Project

This project is an inventory management application that allows you to track and manage information about people and products. It is developed using React and Firebase.

## Demo
If you want to take a closer look at the project and explore its features, you can visit and use https://inventory.alpozk.com/

- Login credentials:
- Email: trial.inventory@alpozk.com
- Password: inventory1*

Feel free to check out the website to see the project in action.

## Installation

1. Create a Firebase account and obtain the required project tokens.
2. Create a database from Firestore Firestore Database.
3. Create a `.env` file in main folder and set your Firebase tokens as follows:

```
REACT_APP_API_KEY="Firebase API Key"
REACT_APP_AUTH_DOMAIN="Firebase Auth Domain"
REACT_APP_PROJECT_ID="Firebase Project ID"
REACT_APP_STORAGE_BUCKET="Firebase Storage Bucket"
REACT_APP_MESSAGING_SENDER_ID="Firebase Messaging Sender ID"
REACT_APP_APP_ID="Firebase App ID"
REACT_APP_MEASUREMENT_ID="Firebase Measurement ID"
```

4. Activate the login with e-mail and password from the Firebse authentication section.
5. Add a new mail and password by saying add user from the Firebase authentication section. There is no register page in the system, and accounts to be opened must be created from this page.
6. Create a database from Firestore Firestore Database.
7. Run `npm install` to install the required dependencies.
8. Run `npm start` to start the application.

## Features

- Adding new people and products. 
- View a list of people and products. 
- Edit contact and product information. 
- Deleting contact and product information. 
- Ability to assign people and products to each other simultaneously. 
- Searching for people with information such as name, surname and title. 
- Product search with information such as product name, product code, product category.
- Printing a list of people and products.
- There are two language options, English and Turkish.
- Localization infrastructure is ready for developers.


## Build

1. Run `npm run build` to build the project.
2. The build artifacts will be stored in the `build/` directory.
3. You can add the files in the build folder to your server and use them on your server.

## Note
You might need the `.htaccess` file in the main folder for your server. It helps with directions. You can add it when you set up. If needed, you can change it or make a new one.




