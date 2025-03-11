import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Container, Col, Form, Button, Card, Row } from "react-bootstrap";
import { useMutation } from "@apollo/client";
import { SAVE_BOOK } from "../utils/mutations";
import Auth from "../utils/auth";
import { searchGoogleBooks } from "../utils/API";
import { saveBookIds, getSavedBookIds } from "../utils/localStorage";
import type { Book } from "../models/Book";
import type { GoogleAPIBook } from "../models/GoogleAPIBook";

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState<Book[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  const [saveBook, { error }] = useMutation(SAVE_BOOK);

  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  }, [savedBookIds]);

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchInput) return;

    try {
      const response = await searchGoogleBooks(searchInput);
      if (!response.ok) throw new Error("Something went wrong!");

      const { items } = await response.json();
      const bookData: Book[] = items.map((book: GoogleAPIBook) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors ?? ["Unknown Author"], // ✅ Manejo seguro de `authors`
        title: book.volumeInfo.title,
        description: book.volumeInfo.description ?? "No description available", // ✅ Manejo seguro de `description`
        image: book.volumeInfo.imageLinks?.thumbnail ?? "", // ✅ Manejo seguro de `image`
        link: book.volumeInfo.infoLink ?? "#", // ✅ Manejo seguro de `link`
      }));

      setSearchedBooks(bookData);
      setSearchInput("");
    } catch (err) {
      console.error("Error al buscar libros:", err);
    }
  };

  const handleSaveBook = async (bookId: string) => {
    if (!Auth.loggedIn()) return;

    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
    if (!bookToSave) return;

    try {
      const { data } = await saveBook({
        variables: { bookData: { ...bookToSave } },
      });

      if (!data) throw new Error("No se pudo guardar el libro.");

      setSavedBookIds([...savedBookIds, bookId]);
    } catch (err) {
      console.error("Error al guardar el libro:", err);
    }
  };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name="searchInput"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="text"
                  size="lg"
                  placeholder="Search for a book"
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type="submit" variant="success" size="lg">
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className="pt-5">
          {searchedBooks.length ? `Viewing ${searchedBooks.length} results:` : "Search for a book to begin"}
        </h2>
        <Row>
          {searchedBooks.map((book: Book) => ( // ✅ Tipado correcto en `.map()`
            <Col md="4" key={book.bookId}>
              <Card border="dark">
                {book.image && <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant="top" />}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">
                    Authors: {book.authors?.length ? book.authors.join(", ") : "Unknown Author"}
                  </p>
                  <Card.Text>{book.description}</Card.Text>
                  {Auth.loggedIn() && (
                    <Button
                      disabled={savedBookIds.includes(book.bookId)}
                      className="btn-block btn-info"
                      onClick={() => handleSaveBook(book.bookId)}
                    >
                      {savedBookIds.includes(book.bookId) ? "This book has already been saved!" : "Save this Book!"}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        {error && <p className="text-danger">Error al guardar el libro: {error.message}</p>}
      </Container>
    </>
  );
};

export default SearchBooks;
