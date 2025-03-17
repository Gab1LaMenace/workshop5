import bodyParser from "body-parser";
import express from "express";
import { BASE_NODE_PORT } from "../config";
import { Value } from "../types";

export async function node(
  nodeId: number,
  N: number,
  F: number,
  initialValue: Value,
  isFaulty: boolean,
  nodesAreReady: () => boolean,
  setNodeIsReady: (index: number) => void
) {
  const node = express();
  node.use(express.json());
  node.use(bodyParser.json());


  // TODO implement this
  // this route allows retrieving the current status of the node
  // node.get("/status", (req, res) => {});

  node.get("/status", (req, res) => {
    if (isFaulty) {
      return res.status(500).send("faulty"); // Send a plain string to match test expectations
    }
    return res.status(200).send("live");
  });

  let nodeState = {
    killed: false,
    x: initialValue,
    decided: null,
    k: 0,
  };
  // Route: Get current state of node
  node.get("/getState", (req, res) => {
    if (isFaulty) {
      return res.json({
        killed: false,
        x: null,
        decided: null,
        k: null,
      });
    }
    return res.json(nodeState);
  });

  // TODO implement this
  // this route allows the node to receive messages from other nodes
  // node.post("/message", (req, res) => {});

  // TODO implement this
  // this route is used to start the consensus algorithm
  // node.get("/start", async (req, res) => {});

  // TODO implement this
  // this route is used to stop the consensus algorithm
  // node.get("/stop", async (req, res) => {});

  // TODO implement this
  // get the current state of a node
  // node.get("/getState", (req, res) => {});
  // Define initial node state

  //originally here
  // Start the server
  const server = node.listen(BASE_NODE_PORT + nodeId, async () => {
    console.log(
      `Node ${nodeId} is listening on port ${BASE_NODE_PORT + nodeId}`
    );

    // Mark the node as ready
    setNodeIsReady(nodeId);
  });

  return server;
}