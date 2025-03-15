// src/pages/Dashboard.js
import React from "react";
import Layout from "../components/Layout";
import InputPost from "./posting/InputPost";
import OutputPost from "./posting/OutputPost";

const Dashboard = () => {

  return (
    <Layout showRightColumn={true}>
      <InputPost />
      <OutputPost />
    </Layout>
  );
};

export default Dashboard;
