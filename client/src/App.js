import { BookCard } from "./BookCard";
import "./App.css";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import books from "./books.json";
import categories from "./categories.json";
import { useEffect, useState } from "react";
import {
  Card,
  Box,
  Paper,
  Typography,
  Slider,
  Stack,
  Button,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import Divider from "@mui/material/Divider";
import LoadingButton from "@mui/lab/LoadingButton";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
const axios = require("axios").default;

const ratings = {
  One: "⭐",
  Two: "⭐⭐",
  Three: "⭐⭐⭐",
  Four: "⭐⭐⭐⭐",
  Five: "⭐⭐⭐⭐⭐",
};

function App() {
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);

  const allBooks = JSON.parse(localStorage.getItem("allBooks"))
    ? JSON.parse(localStorage.getItem("allBooks"))
    : [];

  const goToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const fetchBooks = () => {
    setFetchingData(true);
    console.log("test");
    axios
      .get(
        "https://us-east1-tamid-bookscraper-349319.cloudfunctions.net/scrape"
      )
      .then(function (response) {
        // handle success
        localStorage.setItem("allBooks", JSON.stringify(response.data));
        setFilteredBooks(response.data);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(function () {
        // always executed
        setFetchingData(false);
      });
  };

  const disabledAccordionError = () => {
    if (allBooks.length === 0) {
      setError(true);
    }
  };

  const hideError = () => {
    setError(false);
  };

  const handleSearch = (event) => {
    if (event.key === "Enter") {
      setSearch(event.target.value);
    }
  };

  const clearFilters = () => {
    setRatingFilter([]);
    setCategoryFilter([]);
  };

  useEffect(() => {
    let bookResults = allBooks;

    if (ratingFilter !== undefined && ratingFilter.length !== 0) {
      bookResults = bookResults.filter((book) => {
        return ratingFilter.includes(ratings[book.rating]);
      });
    }

    if (categoryFilter !== undefined && categoryFilter.length !== 0) {
      bookResults = bookResults.filter((book) => {
        return categoryFilter.includes(book.category);
      });
    }

    if (search !== undefined && search !== "") {
      console.log(search);
      console.log(bookResults);
      bookResults = bookResults.filter((book) => {
        return book.upc.toLowerCase().match(search.toLowerCase());
      });
      console.log(bookResults);
    }

    setFilteredBooks(bookResults);
  }, [search, ratingFilter, categoryFilter]);

  return (
    <div className="app">
      <CssBaseline />
      <Container className="container" maxWidth="lg">
        <Box className="fetchBooksWrapper">
          <LoadingButton
            variant="contained"
            loading={fetchingData}
            onClick={fetchBooks}
            disabled={allBooks.length !== 0}
          >
            Fetch Books
          </LoadingButton>
        </Box>
        <Box className="stickyWrapper gray">
          <Accordion
            elevation={0}
            className="accordian"
            disabled={allBooks.length === 0}
            onClick={disabledAccordionError}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              className="gray"
            >
              <Typography>Search & Filters</Typography>
            </AccordionSummary>
            <AccordionDetails className="accordianContent gray">
              <div className="inputsWrapper">
                <div className="searchWrapper">
                  <Typography variant="caption">Search</Typography>
                  <Autocomplete
                    id="search"
                    freeSolo
                    options={filteredBooks.map((book) => book.upc)}
                    onChange={(event) => {
                      setSearch(event.target.innerText);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="UPC"
                        onKeyUp={handleSearch}
                      />
                    )}
                  />
                </div>
                <Divider orientation="vertical" flexItem />
                <div className="filterWrapper">
                  <Typography variant="caption">Filters</Typography>
                  <div className="filterGroup">
                    <div className="filterItem">
                      <Autocomplete
                        multiple
                        limitTags={1}
                        value={ratingFilter}
                        id="rating-filter"
                        options={Object.values(ratings)}
                        filterSelectedOptions
                        onChange={(event, value) => setRatingFilter(value)}
                        renderInput={(params) => (
                          <TextField {...params} label="Ratings" />
                        )}
                      />
                    </div>
                    <div className="filterItem">
                      <Autocomplete
                        multiple
                        limitTags={1}
                        value={categoryFilter}
                        id="category-filter"
                        options={categories}
                        filterSelectedOptions
                        onChange={(event, value) => setCategoryFilter(value)}
                        renderInput={(params) => (
                          <TextField {...params} label="Categories" />
                        )}
                      />
                    </div>
                    <div className="clearFilterItem">
                      <Button fullWidth onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <Divider />
              <div className="searchResultsWrapper">
                <Typography>
                  <span className="bold">{filteredBooks.length}</span> results
                </Typography>
              </div>
            </AccordionDetails>
          </Accordion>
        </Box>
        <div className="bookResultsWrapper">
          {filteredBooks.map((book, index) => {
            return <BookCard bookData={book} key={book.upc} />;
          })}
        </div>
        <Snackbar
          open={error}
          autoHideDuration={3000}
          onClose={hideError}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={hideError} severity="error" sx={{ width: "100%" }}>
            Books must be fetched before they can be searched or filtered.
          </Alert>
        </Snackbar>
        <Snackbar
          open={fetchingData}
          autoHideDuration={300000}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity="info" sx={{ width: "100%" }}>
            Please wait 3-5 minutes for request to complete.
          </Alert>
        </Snackbar>
        <IconButton
          aria-label="back-to-top"
          color="primary"
          id="backToTop"
          size="large"
          onClick={goToTop}
        >
          <ArrowCircleUpIcon />
        </IconButton>
      </Container>
    </div>
  );
}

export default App;
