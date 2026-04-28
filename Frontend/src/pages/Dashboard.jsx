import React, { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { setProfile, setLoading, setError } from "../features/doctorSlice";
import apiRequest from "../utils/apiRequest";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.doctor);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      const res = await apiRequest.get("/doctor");
      dispatch(setProfile(res.data.data));
    };
    fetchDoctorProfile();
  }, []);

  return <div>Dashboard</div>;
};

export default Dashboard;
