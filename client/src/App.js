import { BookCard } from "./components/BookCard";
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

const ratings = {
  One: "⭐",
  Two: "⭐⭐",
  Three: "⭐⭐⭐",
  Four: "⭐⭐⭐⭐",
  Five: "⭐⭐⭐⭐⭐",
};

function App() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState(books);

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
    setLoading(true);
    let bookResults = books;

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
    setLoading(false);
  }, [search, ratingFilter, categoryFilter]);

  return (
    <div className="app">
      <CssBaseline />
      <Container className="container" maxWidth="lg">
        <Box className="stickyWrapper gray">
          <Accordion elevation={0}>
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
                      <LoadingButton
                        loading={loading}
                        fullWidth
                        onClick={clearFilters}
                      >
                        Clear Filters
                      </LoadingButton>
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
          {loading
            ? "hi"
            : filteredBooks.map((book, index) => {
                return <BookCard bookData={book} key={book.upc} />;
              })}
        </div>
      </Container>
    </div>
  );
}

export default App;
