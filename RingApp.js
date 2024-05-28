import React, { useState, useEffect } from 'react';
import './RingApp.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';

function RingApp() {
  const [inputValue, setInputValue] = useState(''); 
  const [isbnList, setIsbnList] = useState([]); 
  const [bookDetails, setBookDetails] = useState({}); 
  const [isLoading, setIsLoading] = useState(false); 
  const [ratings, setRatings] = useState({}); 
  const [error, setError] = useState(''); 
  
  // Load data from localStorage
  useEffect(() => {
    
    const savedIsbnList = JSON.parse(localStorage.getItem('isbnList')) || [];
    const savedBookDetails = JSON.parse(localStorage.getItem('bookDetails')) || {};
    const savedRatings = JSON.parse(localStorage.getItem('ratings')) || {};

    setIsbnList(savedIsbnList);
    setBookDetails(savedBookDetails);
    setRatings(savedRatings);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    
    localStorage.setItem('isbnList', JSON.stringify(isbnList));
    localStorage.setItem('bookDetails', JSON.stringify(bookDetails));
    localStorage.setItem('ratings', JSON.stringify(ratings));
  }, [isbnList, bookDetails, ratings]);

  // Handle ISBM input
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  // API call to get book details
  const fetchBookDetails = async (isbn) => {
    setIsLoading(true);

    try {
      const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
      const data = await response.json();
      setBookDetails((prevDetails) => ({ ...prevDetails, [isbn]: data }));
    } catch (error) {
      console.error('Error fetching book details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get book cover
  const fetchCoverImage = (isbn) => {
    return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  };

  //ISBM check
  const isValidISBN = (isbn) => {
    return /^(97(8|9))?\d{9}(\d|X)$/.test(isbn);
  };

  // Handle ISBM when button is clicked
  const handleAddIsbm = (event) => {
    event.preventDefault();
    if (inputValue.trim() !== '') {
      if (isValidISBN(inputValue.trim())) {
        setIsbnList([...isbnList, inputValue.trim()]);
        setRatings((prevRatings) => ({ ...prevRatings, [inputValue.trim()]: 0 })); 
        setInputValue(''); 
        setError(''); 
      } else {
        setError('Invalid ISBN number. Please enter a valid ISBN.');
      }
    }
  };

  // Handles star rating
  const handleRatingChange = (isbn, newRating) => {
    setRatings((prevRatings) => ({ ...prevRatings, [isbn]: newRating }));
  };

  // Handles delete button
  const handleDelete = (isbn) => {
    setIsbnList(isbnList.filter(item => item !== isbn));
    const { [isbn]: _, ...newBookDetails } = bookDetails;
    setBookDetails(newBookDetails);
    const { [isbn]: __, ...newRatings } = ratings;
    setRatings(newRatings);
  };

  // Get current list of books added
  useEffect(() => {
    isbnList.forEach((isbn) => {
      fetchBookDetails(isbn);
    });
  }, [isbnList]);

  return (
    <div className="custom-container text-white">
      <h1 className="text-center title">Book Inventory Manager</h1>
      <form onSubmit={handleAddIsbm} className="mb-4">
        <label>
          Enter ISBN:
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="form-control cool-textbox"
            placeholder="Enter ISBN"
          />
        </label>
        <button type="submit" className="cool-button" disabled={isLoading}>
          {isLoading ? 'Fetching...' : 'Add Book'}
        </button>
      </form>
      {error && <div className="alert alert-danger mt-3">{error}</div>}

      <div className="card-container">
        {isbnList.map((isbn) => (
          <div key={isbn} className="card book-details-container bg-dark text-white custom-card">
            <div className="card-body d-flex flex-column justify-content-between" style={{ height: '400px' }}>
              <h2 className="card-title card-text">{bookDetails[isbn]?.[`ISBN:${isbn}`]?.title || 'Title not available'}</h2>
              {bookDetails[isbn] && (
                <>
                  <p className="card-text">Author: {bookDetails[isbn][`ISBN:${isbn}`]?.authors?.map(author => author.name).join(', ') || 'Author not available'}</p>
                  <p className="card-text">Rating: {ratings[isbn]}/5</p>
                  <StarRating rating={ratings[isbn]} onRatingChange={(newRating) => handleRatingChange(isbn, newRating)} />
                </>
              )}
              <div className="card-img-container">
                <img src={fetchCoverImage(isbn)} alt="Book Cover" className="img-fluid" />
              </div>
              <button className="btn btn-danger mt-2" onClick={() => handleDelete(isbn)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Star rating function
function StarRating({ rating, onRatingChange }) {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : ''}`}
          onClick={() => onRatingChange(i)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="star-rating">
      {renderStars()}
    </div>
  );
}

export default RingApp;
