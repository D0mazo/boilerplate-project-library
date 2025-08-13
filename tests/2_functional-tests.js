const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(5000); // Increase timeout for async operations

  suite('Routing tests', function() {
    suite('POST /api/books with title => create book object/expect book object', function() {
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book' })
          .end(function(err, res) {
            assert.equal(res.status, 200, 'Response status should be 200');
            assert.isObject(res.body, 'Response should be an object');
            assert.property(res.body, '_id', 'Book should contain _id');
            assert.property(res.body, 'title', 'Book should contain title');
            assert.equal(res.body.title, 'Test Book', 'Book title should match input');
            done();
          });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 200, 'Response status should be 200');
            assert.isString(res.text, 'Response should be a string');
            assert.equal(res.text, 'missing required field title', 'Should return error message');
            done();
          });
      });
    });

    suite('GET /api/books => array of books', function() {
      test('Test GET /api/books', function(done) {
        chai.request(server)
          .get('/api/books')
          .end(function(err, res) {
            assert.equal(res.status, 200, 'Response status should be 200');
            assert.isArray(res.body, 'Response should be an array');
            if (res.body.length > 0) {
              assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
              assert.property(res.body[0], 'title', 'Books in array should contain title');
              assert.property(res.body[0], '_id', 'Books in array should contain _id');
            }
            done();
          });
      });      
    });

    suite('GET /api/books/[id] => book object with [id]', function() {
      test('Test GET /api/books/[id] with id not in db', function(done) {
        chai.request(server)
          .get('/api/books/123456789012')
          .end(function(err, res) {
            assert.equal(res.status, 200, 'Response status should be 200');
            assert.isString(res.text, 'Response should be a string');
            assert.equal(res.text, 'no book exists', 'Should return error message');
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book for ID' })
          .end(function(err, res) {
            assert.equal(res.status, 200, 'Book creation status should be 200');
            const bookId = res.body._id;
            chai.request(server)
              .get(`/api/books/${bookId}`)
              .end(function(err, res) {
                assert.equal(res.status, 200, 'Response status should be 200');
                assert.isObject(res.body, 'Response should be an object');
                assert.property(res.body, '_id', 'Book should contain _id');
                assert.property(res.body, 'title', 'Book should contain title');
                assert.property(res.body, 'comments', 'Book should contain comments');
                assert.isArray(res.body.comments, 'Comments should be an array');
                assert.equal(res.body._id, bookId, 'Book ID should match');
                done();
              });
          });
      });
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function() {
      test('Test POST /api/books/[id] with comment', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book for Comment' })
          .end(function(err, res) {
            assert.equal(res.status, 200, 'Book creation status should be 200');
            const bookId = res.body._id;
            chai.request(server)
              .post(`/api/books/${bookId}`)
              .send({ comment: 'Test comment' })
              .end(function(err, res) {
                assert.equal(res.status, 200, 'Response status should be 200');
                assert.isObject(res.body, 'Response should be an object');
                assert.property(res.body, '_id', 'Book should contain _id');
                assert.property(res.body, 'title', 'Book should contain title');
                assert.property(res.body, 'comments', 'Book should contain comments');
                assert.isArray(res.body.comments, 'Comments should be an array');
                assert.include(res.body.comments, 'Test comment', 'Comments should include posted comment');
                done();
              });
          });
      });

      test('Test POST /api/books/[id] without comment field', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book for Empty Comment' })
          .end(function(err, res) {
            assert.equal(res.status, 200, 'Book creation status should be 200');
            const bookId = res.body._id;
            chai.request(server)
              .post(`/api/books/${bookId}`)
              .send({})
              .end(function(err, res) {
                assert.equal(res.status, 200, 'Response status should be 200');
                assert.isString(res.text, 'Response should be a string');
                assert.equal(res.text, 'missing required field comment', 'Should return error message');
                done();
              });
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done) {
        chai.request(server)
          .post('/api/books/123456789012')
          .send({ comment: 'Test comment' })
          .end(function(err, res) {
            assert.equal(res.status, 200, 'Response status should be 200');
            assert.isString(res.text, 'Response should be a string');
            assert.equal(res.text, 'no book exists', 'Should return error message');
            done();
          });
      });
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {
      test('Test DELETE /api/books/[id] with valid id in db', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book for Delete' })
          .end(function(err, res) {
            assert.equal(res.status, 200, 'Book creation status should be 200');
            const bookId = res.body._id;
            chai.request(server)
              .delete(`/api/books/${bookId}`)
              .end(function(err, res) {
                assert.equal(res.status, 200, 'Response status should be 200');
                assert.isString(res.text, 'Response should be a string');
                assert.equal(res.text, 'delete successful', 'Should return success message');
                done();
              });
          });
      });

      test('Test DELETE /api/books/[id] with id not in db', function(done) {
        chai.request(server)
          .delete('/api/books/123456789012')
          .end(function(err, res) {
            assert.equal(res.status, 200, 'Response status should be 200');
            assert.isString(res.text, 'Response should be a string');
            assert.equal(res.text, 'no book exists', 'Should return error message');
            done();
          });
      });
    });

    suite('DELETE /api/books => delete all books', function() {
      test('Test DELETE /api/books', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book for Delete All' })
          .end(function(err, res) {
            assert.equal(res.status, 200, 'Book creation status should be 200');
            chai.request(server)
              .delete('/api/books')
              .end(function(err, res) {
                assert.equal(res.status, 200, 'Response status should be 200');
                assert.isString(res.text, 'Response should be a string');
                assert.equal(res.text, 'complete delete successful', 'Should return success message');
                done();
              });
          });
      });
    });
  });
});