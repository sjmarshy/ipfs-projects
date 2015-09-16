#!/usr/bin/env node

/* eslint no-process-exit:0 */

"use strict";

const program = require("commander");
const p = require("../package.json");
const {writeFileSync, readFileSync} = require("fs");
const {join} = require("path");

const itemPath = join(process.env.HOME, ".ipfsprojetcs");

const getitemFile = () => JSON.parse(readFileSync(itemPath, "utf8"));

const itemFilter = (pfile, item) => pfile.filter((proj) => proj.name === item);

const itemExists = (pfile, item) => itemFilter(pfile, item) > 0;

const getitem = (pfile, item) => itemExists(pfile, item) ?
	itemFilter(pfile, item)[0] : false;

const versionExists = (item, version) => item.versions
  .filter((k) => k === version).length > 0;

const init = () => {

	try {
		writeFileSync(itemPath, "[]");
		return true;
	} catch (e) {

		process.stdout.write(e.message);
		process.exit(1);
	}
};

const additem = (itemName) => {

	let pfile = getitemFile();

	let exists = itemExists(pfile, itemName);

	if (exists) {

		pfile.push({
			name: itemName,
			versions: {}
		});

		writeFileSync(itemPath, JSON.stringify(pfile), "utf8");
		console.log(itemName + " added to list of projcets");
	} else {

		console.log("item " + itemName + " already tracked");
	}
};

const addVersion = (itemName, pathName, version) => {

  let pfile = getitemFile();

  if (!itemExists(pfile, itemName)) {
    additem(itemName);
  }

  let item = getitem(pfile, itemName);

  if (versionExists(item, version)) {
    console.log("version " + version +
        "is already published at " +
        item[version]);
    process.exit(1);
  } else {

    let hash = ipfsAdd(pathName);

    item[version] = hash;

    console.log(hash);

    saveitemFile(pfile);
  }

  // check if the item exists, if not then we make it.
  // check that the version hasn't been published before
  // ipfs add pathname
  // grab the hash and store it in the items version object,
  // with the version as the key
};

program.version(p.version);

program.command("init")
	.description("initialise your item storage")
	.action(init);

program.command("add <itemname> <pathname> <version>")
	.description("publish a new item version to ipfs")
	.action(addVersion);

program.command("open <itemname> [versionname]",
			"open the latest version of a item, or a specific" +
			"version, in your browser")
	.action(()=>{});

program.command("list [itemname]",
		"without [itemname], list your items, with" +
		" [itemname], list the published versions of that" +
		" item")
	.action(()=>{});


program.command("publish",
		"generate a HTML page which lists all of your" +
		" stored items and publish it under your ipns")
	.action(()=>{});

program.parse(process.argv);