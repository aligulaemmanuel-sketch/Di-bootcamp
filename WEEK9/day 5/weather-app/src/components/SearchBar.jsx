import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Autocomplete,
  CircularProgress,
  InputAdornment,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {
  ENGLISH_LETTERS_ONLY,
  MIN_SEARCH_LENGTH,
  SEARCH_DEBOUNCE_MS,
} from '../constants';
import { searchCities, setLocation } from '../store/weatherSlice';

export default function SearchBar() {
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const isValid = ENGLISH_LETTERS_ONLY.test(input);
  const query = input.trim();
  const canSearch = isValid && query.length >= MIN_SEARCH_LENGTH;

  useEffect(() => {
    if (!canSearch) {
      setOptions([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const cities = await dispatch(searchCities(query)).unwrap();
        if (!cancelled) setOptions(cities);
      } catch {
        // Already reported through the error toast
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [canSearch, query, dispatch]);

  const handleSelect = (_, city) => {
    if (!city) return;
    dispatch(setLocation(city));
    setInput('');
    setOptions([]);
  };

  let noOptionsText = 'No cities found';
  if (!isValid) noOptionsText = 'Use English letters only';
  else if (!canSearch) noOptionsText = `Type at least ${MIN_SEARCH_LENGTH} letters`;

  return (
    <Autocomplete
      value={null}
      inputValue={input}
      options={options}
      loading={loading}
      blurOnSelect
      filterOptions={(cities) => cities}
      getOptionLabel={(city) => `${city.name}, ${city.country}`}
      isOptionEqualToValue={(a, b) => a.key === b.key}
      noOptionsText={noOptionsText}
      onInputChange={(_, value) => setInput(value)}
      onChange={handleSelect}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search for a city"
          placeholder="e.g. Tel Aviv"
          error={!isValid}
          helperText={isValid ? ' ' : 'Please use English letters only'}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading && <CircularProgress size={18} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
