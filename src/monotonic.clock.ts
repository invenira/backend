const time = () => Number(process.hrtime.bigint() / 1_000_000n);

const timeDiff = (s: number) => Number(time() - s);

export { time, timeDiff };
