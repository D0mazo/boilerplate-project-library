'use strict';

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: { type: [String], default: [] },
  commentcount: { type: Number, default: 0 }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {
  app.route('/api/books')
    .get(async function (req, res) {
      try {
        const books = await Book.find().select('_id title commentcount');
        res.json(books);
      } catch (err) {
        res.status(500).json({ error: 'server error' });
      }
    })
    
    .post(async function (req, res) {
      let title = req.body.title;
      if (!title) {
        return res.status(200).send('missing required field title');
      }
      try {
        const newBook = new Book({ title });
        const savedBook = await newBook.save();
        res.json({ _id: savedBook._id, title: savedBook.title });
      } catch (err) {
        res.status(500).json({ error: 'server error' });
      }
    })
    
    .delete(async function (req, res) {
      try {
        await Book.deleteMany({});
        res.status(200).send('complete delete successful');
      } catch (err) {
        res.status(500).json({ error: 'server error' });
      }
    });

  app.route('/api/books/:id')
    .get(async function (req, res) {
      let bookid = req.params.id;
      try {
        const book = await Book.findById(bookid).select('_id title comments');
        if (!book) {
          return res.status(200).send('no book exists');
        }
        res.json(book);
      } catch (err) {
        res.status(200).send('no book exists');
      }
    })
    
    .post(async function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      if (!comment) {
        return res.status(200).send('missing required field comment');
      }
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.status(200).send('no book exists');
        }
        book.comments.push(comment);
        book.commentcount = book.comments.length;
        const updatedBook = await book.save();
        res.json({ _id: updatedBook._id, title: updatedBook.title, comments: updatedBook.comments });
      } catch (err) {
        res.status(200).send('no book exists');
      }
    })
    
    .delete(async function (req, res) {
      let bookid = req.params.id;
      try {
        const result = await Book.findByIdAndDelete(bookid);
        if (!result) {
          return res.status(200).send('no book exists');
        }
        res.status(200).send('delete successful');
      } catch (err) {
        res.status(200).send('no book exists');
      }
    });
};