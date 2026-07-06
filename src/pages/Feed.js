import React from "react";
import Layout from "../components/Layout";
import StoriesBar from "../components/stories/StoriesBar";
import PostFeed from "./posting/PostFeed";

const Feed = () => (
  <Layout showRightColumn>
    <StoriesBar />
    <PostFeed />
  </Layout>
);

export default Feed;
