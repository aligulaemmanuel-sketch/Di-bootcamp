import React from "react";
import AddCategory from "./components/AddCategory";
import CategoryList from "./components/CategoryList";
import ErrorBanner from "./components/ErrorBanner";
import Footer from "./components/Footer";

export default function App() {
  return (
    <main className="app">
      <h1>Todo List</h1>
      <ErrorBanner />
      <AddCategory />
      <CategoryList />
      <Footer />
    </main>
  );
}
