import React, { useState, useEffect } from "react";
import "./App.css";
import lottery from "./lottery";
import web3 from "./web3";

const App = () => {
  const [manager, setManager] = useState("loading manager...");
  const [players, setPlayers] = useState([]);
  const [balance, setBalance] = useState(0);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const manager = await lottery.contract.methods.manager().call();
      setManager(manager);

      const balance = await web3.eth.getBalance(lottery.address);
      setBalance(balance);

      const players = await lottery.contract.methods
        .getPlayers()
        .call({ from: manager });
      setPlayers(players);
    };

    fetchData();
  }, []);

  const play = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    await lottery.contract.methods.play().send({
      from: accounts[0],
      value: web3.utils.toWei(value, "ether"),
      gas: "1000000",
      gasPrice: await web3.eth.getGasPrice(),
    });
    setPlayers([...players, accounts[0]]);
  };

  const pickWinner = async () => {
    await lottery.contract.methods.pickWinner().send({
      from: manager,
      gas: "1000000",
      gasPrice: await web3.eth.getGasPrice(),
    });

    const balance = await web3.eth.getBalance(lottery.address);
    setBalance(balance);

    const players = await lottery.contract.methods
      .getPlayers()
      .call({ from: manager });
    setPlayers(players);
  };

  return (
    <div className="App">
      <div className="container">
        <img src="/lottery-sepolia/logo192.png" alt="Lottery Logo" className="logo" />
        <h1>🎰 Lottery Contract 🎰</h1>
        <p className="manager">
          Managed by: <strong>{manager}</strong>
        </p>
        <p className="players">
          👥 {players.length} participants | 💰{" "}
          {web3.utils.fromWei(balance, "ether")} ETH Prize Pool
        </p>
        <button className="winner-btn" onClick={pickWinner}>
          🎯 Pick a Winner
        </button>
        <hr />
        <p className="play-text">💸 Join the game (Min: 0.001 ETH)</p>
        <form onSubmit={play} className="play-form">
          <input
            className="input"
            placeholder="Enter amount"
            onChange={(e) => setValue(e.target.value)}
          />
          <button type="submit" className="play-btn">
            🚀 Deposit
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
