import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import store from "./store";
import { Provider } from "react-redux";
import setAuthenticationToken from "./middleware/setAuthenticationToken";
import { userLoaded } from "./actions/auth.actions";
import IsLoggedInRoute from "./routes/IsLoggedInRoute";
import PrivateRoute from "./routes/PrivateRoute";

if (localStorage.getItem("token")) {
  setAuthenticationToken(localStorage.getItem("token"));
}

const App = () => {
  useEffect(() => {
    store.dispatch(userLoaded());
  }, []);
  return (
    <Router>
      <Provider store={store}>
        <Navbar />
        <Switch>
          <Route path="/" exact component={LandingPage} />
          <IsLoggedInRoute path="/register" exact component={RegisterPage} />
          <IsLoggedInRoute path="/login" exact component={LoginPage} />
        </Switch>
        <Footer />
      </Provider>
    </Router>
  );
};

export default App;
