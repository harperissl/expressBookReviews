const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

function getBooks() {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
}

function getByISBN(isbn) {
  return new Promise((resolve, reject) => {
    let isbnNum = parseInt(isbn);
    if (books[isbnNum]) {
      resolve(books[isbnNum]);
    } else {
      reject({ status: 404, message: `ISBN ${isbn} not found` });
    }
  })
}

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;


  if (username && password) {
    if (!doesExist(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registred. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const bks = await getBooks();
    res.send(JSON.stringify(bks));
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  getByISBN(req.params.isbn)
    .then(
      result => res.send(result),
      error => res.status(error.status).json({ message: error.message })
    );
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  let ans = []
  for (const [key, values] of Object.entries(books)) {
    const book = Object.entries(values);
    for (let i = 0; i < book.length; i++) {
      if (book[i][0] == 'author' && book[i][1] == req.params.author) {
        ans.push(books[key]);
      }
    }
  }
  if (ans.length == 0) {
    return res.status(300).json({ message: "Author not found" });
  }
  res.send(ans);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  let ans = []
  for (const [key, values] of Object.entries(books)) {
    const book = Object.entries(values);
    for (let i = 0; i < book.length; i++) {
      if (book[i][0] == 'title' && book[i][1] == req.params.title) {
        ans.push(books[key]);
      }
    }
  }
  if (ans.length == 0) {
    return res.status(300).json({ message: "Title not found" });
  }
  res.send(ans);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  getByISBN(req.params.isbn)
    .then(
      result => res.send(result.reviews),
      error => res.status(error.status).json({ message: error.message })
    );
});

module.exports.general = public_users;
