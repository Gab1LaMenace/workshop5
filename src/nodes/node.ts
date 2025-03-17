import bodyParser from "body-parser";
import express from "express";
import { BASE_NODE_PORT } from "../config";
import { NodeState, Value } from "../types"; // Import NodeState and Value from types.ts

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

  // Initialize the node state
  let nodeState: NodeState = {
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

  // Route: Node receives messages from other nodes
  node.post("/message", (req, res) => {
    const { message } = req.body;

    if (!message) {
      return res.status(400).send("Message is required.");
    }

    console.log(`Node ${nodeId} received message: ${message}`);

    if (message === "start") {
      nodeState.killed = false;
      nodeState.x = initialValue;
      nodeState.decided = null;
      nodeState.k = 0;
      console.log(`Node ${nodeId} started consensus with value ${initialValue}`);
      return res.status(200).send("Consensus started.");
    } else if (message === "kill") {
      nodeState.killed = true;
      console.log(`Node ${nodeId} has been killed.`);
      return res.status(200).send("Node killed.");
    }

    return res.status(400).send("Invalid message.");
  });

  // Route: Start the consensus algorithm
  node.get("/start", async (req, res) => {
    if (nodeState.killed) {
      return res.status(400).send("Node is killed and cannot start the consensus.");
    }

    if (nodeState.decided !== null) {
      return res.status(400).send("Consensus already decided.");
    }

    // Start the consensus process (customize based on your algorithm)
    console.log(`Node ${nodeId} is starting the consensus process...`);

    // Step 1: Broadcast the initial value to other nodes (assuming broadcasting is happening)

    // Step 2: Process messages from other nodes and decide on a value.
    let finalValue: Value | null = null;
    let consensusRound = 0;

    while (!finalValue && consensusRound < 3) { // Simulate consensus rounds, adjust as needed
      consensusRound++;

      // Step 3: After receiving enough messages, determine the value.
      const messages = await getMessagesForNode(nodeId); // Get messages from other nodes (implement as needed)

      // Consensus logic: Check for majority or unanimous agreement
      const counts = { 0: 0, 1: 0, "?": 0 };
      messages.forEach((message) => counts[message]++);

      if (counts[1] >= N - F) {  // Non-faulty majority
        finalValue = 1;
      } else if (counts[0] >= N - F) { // Non-faulty majority
        finalValue = 0;
      } else {
        finalValue = "?"; // If no majority, set to unknown
      }

      console.log(`Node ${nodeId} reached consensus with value ${finalValue}`);
      nodeState.x = finalValue;
      nodeState.k = consensusRound;
      nodeState.decided = true; // Set as decided after reaching consensus

      // Broadcast final value to other nodes (optional step)
      await broadcastFinalValue(nodeId, finalValue); // Implement broadcasting if needed
    }

    return res.status(200).send("Consensus started successfully.");
  });

  // Route: Stop the consensus algorithm
  node.get("/stop", async (req, res) => {
    if (nodeState.killed) {
      return res.status(400).send("Node is already killed and cannot stop the consensus.");
    }

    // Stop the consensus process (customize based on your algorithm)
    console.log(`Node ${nodeId} is stopping the consensus process...`);
    
    nodeState.killed = true; // Mark node as killed
    nodeState.decided = null; // Reset decision

    return res.status(200).send("Consensus stopped.");
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

// Helper functions to simulate message sending and broadcasting (implement as needed)
async function getMessagesForNode(nodeId: number): Promise<Value[]> {
  // Placeholder: Replace with actual message gathering logic from other nodes
  return [1, 0, 1, 1, 1, 0, 0, 1, 1]; // Example messages, simulate fault tolerance scenario
}

async function broadcastFinalValue(nodeId: number, finalValue: Value) {
  // Placeholder: Implement logic to broadcast the final value to other nodes
  console.log(`Broadcasting final value ${finalValue} from node ${nodeId}`);
}
