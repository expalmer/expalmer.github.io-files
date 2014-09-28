---
draft: true
title: "Porting a MongoDB Full Text Search App to Elasticsearch"
titleFull: "Porting a MongoDB Full Text Search App to Elasticsearch"
resume: "MongoHQ is now Compose – Learn More A few weeks ago we showed how you could use MongoDB’s full text search facility to index and search a field with scored results. As we’ve just launched Elasticsearch,…"
description: "Pensando em criar seu blog com um gerador de sites estático ? Metalsmith é legal!"
author: "Denise Wood Oliveira"
date: 2014-03-01
template: article.hbt
tags: ruby on rails
gist: ricardobeat/6314596, expalmer/5f1693761a94c215cb23, expalmer/beca5945f19792228900
---

A few weeks ago we showed how you could use MongoDB’s full text search facility to index and search a field with scored results. As we’ve just launched Elasticsearch, we thought porting the simple web application created in that article to Elasticsearch would be a good place to start. So, let’s dive in and get porting. If you want to follow along, copy the code from the MongoDB example at ftslite into a clean directory and we can begin.

The first thing we need is an Elasticsearch library for Node.js; the good folks at Elasticsearch produce elasticsearch.js which is an full implementation of the Elasticsearch API. You can install it with npm install elasticsearch --save in your applications directory. With that in place, we can open index.js for editing.

gist:ricardobeat/6314596

The first change we’ll make is in the require section. Where the application requires MongoDB…

gist:expalmer/5f1693761a94c215cb23

gist:expalmer/beca5945f19792228900
