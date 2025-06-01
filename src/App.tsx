import Form from "./components/Form";
import Hero from "./components/Hero";

// restate the problem in my own words:
// In the app, after the user enters in their data
// pivot prince should return a dummy pivot table and a dummy message
/*
 * input excel file name - string
 * input template type - string
 * output - tsx - displays dummy pivot table and a dummy message
 * Concrete Example:
 *  What would the output be for:
 *    A .csv file named "fico.csv" and template "FDPS"?
 *      A TSX container that has the dummy pivot table and below it,
 *      a dummy message
 *
 * Breaking it down:
 *  1. Upload file - get the file name
 *  2. Select template - get the selected template name
 *  3. Submit the 2 pieces of data together
 *  4. Reset all input fields
 *  5. Display 'Generated Response Container' (holds expected return data)
 */
function App() {
  return (
    <main className="bg-gray-900">
      <Hero />
      <Form />
    </main>
  );
}

export default App;
