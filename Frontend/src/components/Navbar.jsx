import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/usersSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.users);
  console.log(currentUser);

  const handleLogout = async () => {
    try {
      await apiRequest.post("/users/logout");
      dispatch(logout());
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return <div>Navbar</div>;
};

export default Navbar;
