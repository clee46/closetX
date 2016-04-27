# ClosetX REST API

## Usage

### Creating a New User

The request body should look like this:

```js

{
    "first": "John",
    "last": "Doe",
    "username": "johndoe46",
    "email": "john@doe.com",
    "password": "password",
    "confirmpassword": "password"
}

```

If the user already exists in the database, the server will respond with status 400 and the following message:

```js

{
  "msg": "User Already Exists"
}

```

The server will also respond with status 400 and corresponding message for the following error cases:

* E-mail not provided
* E-mail field was not a valid e-mail address
* First name not provided
* Last name not provided
* Username not provided
* Password not long enough
* "password" and "confirmpassword" properties do not match
