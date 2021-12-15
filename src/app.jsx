import React from "react";
import Background from "./io.jpeg";
const Pagination = ({ items, pageSize, onPageChange }) => {
  
  if (items.length <= 1) return null;

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num);
  const list = pages.map(page => {
    return (
    
      <button key={page} 
      onClick={onPageChange} 
      className="page-item mr-1 px-2"
      style={{backgroundColor: 'lightgreen', borderColor:'lightblue'}}>
        {page}
      </button>

    );
  });
  return (
    <nav>
      <ul className="pagination ml-5">{list}</ul>
    </nav>
  );
};
const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};
function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
};
//todo refractor component Paginate
const useDataApi = (initialUrl, initialData) => {
  //const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = React.useState(initialUrl);

  const [state, dispatch] = React.useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData
  });

  React.useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      throw new Error();
  }
};
// App that gets data from Hacker News url
function App() {
  const [query, setQuery] = React.useState("MIT");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://hn.algolia.com/api/v1/search?query=MIT",
    {
      hits: []
    }
  );
  const handlePageChange = e => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data.hits;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }
  return (
    <div className="w-100 h-100" style={{backgroundImage: `url(${Background})`}}>
      <h2 style={{color: 'lightgreen',fontWeight:'bold', textShadow: '4px 4px 5px black, 4px 4px 5px blue', marginLeft: 30, padding:20}}>Hacker News Articles</h2>
    <React.Fragment>
      <form className="d-flex ml-5"
        onSubmit={event => {
          doFetch("http://hn.algolia.com/api/v1/search?query=${query}");
          event.preventDefault();
        }}
      >
        <input
          type="text"
          value={query}
          style={{borderColor:'lightblue'}}
          onChange={event => setQuery(event.target.value)}
        />
        <button type="submit" style={{backgroundColor: 'lightgreen', borderColor:'lightblue'}}>Search</button>
        <div className="d-flex justify-content-end">
        <input
          type="number"
          className="w-25"
          style={{borderColor:'lightblue'}}
          value={pageSize}
          onChange={event => setPageSize(event.target.value)}
        />
        <label className="ml-1 m-1 text-center" 
        style={{color: 'lightgreen',fontWeight:'bold', textShadow: '4px 4px 5px black, 4px 4px 5px blue', marginLeft:10}}>Articles per Page</label>
        </div>
      </form>
      {isError && <div>Something went wrong ...</div>}

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <ul className="list-group card p-1 mx-5 mb-1">
          {page.map(item => (
            <li className="list-group-item" 
            style={{borderColor: 'lightgreen'}}
            key={item.objectID}>
              <a href={item.url}>{item.title}</a>
            </li>
          ))}
        </ul>
      )}
      <Pagination
        items={data.hits}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </React.Fragment>
    </div>
  );
}

// ========================================
export default App;