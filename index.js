// A demonstration of interacting with custom RPCs using Polkadot js API

const { ApiPromise, WsProvider } = require('@polkadot/api');

// Construct parameters for API instance
const wsProvider = new WsProvider('wss://cc3-4.kusama.network/');

// Alice and Bob addresses
// const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
// const BOB = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';
const FEDERICO = '1t26VpLFo3xcwskHS1Kvj7h7k6PprSdAUHvABPRcJK7c6us';
const JACO = '16aTh4nKEJ7kCznnziFus5dPozKuYbMnb9ogjhSrqS7MaP7H';
const JAM = '15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA';

async function main() {
	// Construct the actual api
	const api = await ApiPromise.create({
		provider: wsProvider,
	});

	// const federicosVotes = await api.query.electionsPhragmen.voting(FEDERICO);
	// console.log("Federico is voting for");
	// console.log(federicosVotes);

	// Get all the council voters from the chain
	console.log("Querying chain for voters and votes");
	const votersAndVotes = await api.query.electionsPhragmen.voting.entries();

	// Get all the candidates from the chain
	// console.log("Querying chain for candidates");
	let members = (await api.query.electionsPhragmen.members()).toJSON().map(x => x[0]);
	const runnersUp = (await api.query.electionsPhragmen.runnersUp()).toJSON().map(x => x[0]);
	const strictCandidates = (await api.query.electionsPhragmen.candidates()).toJSON();

	const candidates = runnersUp.concat(members).concat(strictCandidates);

	// console.log("Members: ", members.length);
	// console.log(members);
	//
	// console.log("Runners Up: ", runnersUp.length);
	// console.log(runnersUp)
	//
	// console.log("Strict Candidates: ", strictCandidates.length);
	// console.log(strictCandidates)
	//
	// console.log("All Candidates: ", candidates.length);
	// console.log(candidates)


	// A new list to keep track of the defuct voters that we'll narc on
	let defunctVoters = [];

	// Start processing data
	let voterIndex = 0;
	votersAndVotes.forEach(([voter, [_, targets_]]) => {
		voterIndex++;
		let targets = targets_.toJSON()
		console.log(`${voterIndex}: ${voter.args.map((k) => k.toHuman())} is voting for ${targets.length} targets:`);

		// Start by assuming this voter is defunct
		let defunct = true;

		targets.forEach(target => {
			// If they were defunct so far, and this target is not a candidate, they are still defunct
			let valid = candidates.includes(target)
			defunct = defunct && !valid;
			console.log(`${target}: ${valid}`);
		});

		if (defunct) {
			defunctVoters.push(
				{
					who: voter.toHuman()[0],
					vote_count: targets.length,
					candidate_count: candidates.length,
				}
			)
		}

	});

	// Print the results
	console.log(`${defunctVoters.length} / ${votersAndVotes.length} voters are defunct and can be reported:`);
	console.log(defunctVoters.map(({who}) => who));
}

main().catch(console.error).finally(() => process.exit());
