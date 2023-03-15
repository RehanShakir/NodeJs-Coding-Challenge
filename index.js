const createTasks = (count) => {
  return [...Array(count)].map(() =>
    [...Array(~~(Math.random() * 10 + 3))]
      .map(() => String.fromCharCode(Math.random() * (123 - 97) + 97))
      .join("")
    );
}

const doTask = (taskName) => {
  const begin=Date.now();
  console.log('\x1b[36m', "[TASK] STARTED: " + taskName)
  return new Promise(function(resolve,reject){
    setTimeout(function(){
      const end = Date.now();
      const timeSpent=(end-begin)+ "ms";
      console.log('\x1b[36m', "[TASK] FINISHED: " + taskName + " in " + timeSpent ,'\x1b[0m');
      resolve(taskName);
    },(Math.random()*200));
  });
}

const execute = async (iterator) => {
  const results = [];
  for (let [index, task] of iterator) {
    try {
      const response = await task.run();
      await task.onSuccess(response);
      results.push(response);
    } catch (e) {
      task.onError(e);
    }
  }
  return results;
}

const manageConcurrency = async (tasks, concurrencyMax, concurrencyCurrent) => {
  const concurrency = concurrencyCurrent > concurrencyMax ? concurrencyMax : concurrencyCurrent;
  const iterator = tasks.entries();
  // workers created
  const workers = [...Array(concurrency)].fill(iterator).map(execute);
  await Promise.allSettled(workers);
}

const getConcurrency = () => {
  const date = new Date();
  const hours = date.getHours();
  if(hours >= 9 && hours <= 17) {
    return 4;
  }
  return 150;
}

(async () => {
  const concurrencyMax = 4 ;
  const NUM_TASKS = 20;
  const taskList = [];
  const concurrency = getConcurrency();
  const taskArr = createTasks(NUM_TASKS);
  
  console.log("[init] Concurrency Algo Testing...")
  console.log("[init] Tasks to process: ", taskArr.length)
  console.log("[init] Task list: " + taskArr)
  console.log("[init] Maximum Concurrency: ", concurrencyMax);
  console.log("[init] Current Concurrency: ", concurrency, "\n");

  for (const task of taskArr) { 
    taskList.push({
      async run() {
        return doTask(task)
      },
      async onSuccess(response) {
        console.log(`Task ${task}: Successful, response = ${response}`);
      },
      async onError(error) {
        console.log(`Task ${task}: Failed, error = ${error}`);
      }
    })
  }

  await manageConcurrency(taskList, concurrencyMax, concurrency);
  console.log('====================== END =========================');
})();