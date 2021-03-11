/**
 * Just a simple function to mimic a slow connection.
 */
 const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));