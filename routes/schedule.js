// routes/schedule.js
const express = require('express');
const router = express.Router();

const fcfs = require('../controllers/fcfs');
const sjf = require('../controllers/sjf');
const srtf = require('../controllers/srtf');
const roundRobin = require('../controllers/roundRobin');
const mlfq = require('../controllers/mlfq');

router.post('/fcfs', (req, res) => {
  const { processes } = req.body;
  const results = fcfs(processes);
  res.json(results);
});

router.post('/sjf', (req, res) => {
  const { processes } = req.body;
  const results = sjf(processes);
  res.json(results);
});

router.post('/srtf', (req, res) => {
  const { processes } = req.body;
  const results = srtf(processes);
  res.json(results);
});

router.post('/roundRobin', (req, res) => {
  const { processes, quantum } = req.body;
  const results = roundRobin(processes, quantum);
  res.json(results);
});

router.post('/mlfq', (req, res) => {
  const { processes, queues } = req.body;
  const results = mlfq(processes, queues);
  res.json(results);
});

module.exports = router;
