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

  // Define initial node state
  let nodeState = {
    killed: false,
    x: initialValue,
    decided: null,
    k: 0,
  };

  // Route: Get node status
  node.get("/status", (req, res) => {
    if (isFaulty) {
      return res.status(500).send("faulty"); // Send a plain string to match test expectations
    }
    return res.status(200).send("live");
  });

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
