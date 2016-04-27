# ClosetX REST API

## Table of Contents
* [Creating a New User](#signup)

### <a id="signup"></a>Creating a New User

Send a POST request to base_URL/api/signup where the request body looks like this:

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

If the user already exists in the database (i.e. the username or e-mail already exists), the server will respond with status 400 and the following message:

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

### Logging into an existing user
