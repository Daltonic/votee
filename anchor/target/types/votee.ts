/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/votee.json`.
 */
export type Votee = {
  "address": "AZCAmomVF6WczUNUtwJUtstHp14zG5GipfXpy6m8RWPs",
  "metadata": {
    "name": "votee",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createPoll",
      "discriminator": [
        182,
        171,
        112,
        238,
        6,
        219,
        14,
        110
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "poll",
          "writable": true
        },
        {
          "name": "counter",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  117,
                  110,
                  116,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "start",
          "type": "u64"
        },
        {
          "name": "end",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "counter",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  117,
                  110,
                  116,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "registerations",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  101,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "registerCandidate",
      "discriminator": [
        91,
        136,
        96,
        222,
        242,
        4,
        160,
        182
      ],
      "accounts": [
        {
          "name": "poll",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "pollId"
              }
            ]
          }
        },
        {
          "name": "candidate",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "registerations",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "pollId",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "vote",
      "discriminator": [
        227,
        110,
        155,
        23,
        136,
        126,
        172,
        25
      ],
      "accounts": [
        {
          "name": "poll",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "pollId"
              }
            ]
          }
        },
        {
          "name": "candidate",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "pollId"
              },
              {
                "kind": "arg",
                "path": "cid"
              }
            ]
          }
        },
        {
          "name": "voter",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "pollId"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "pollId",
          "type": "u64"
        },
        {
          "name": "cid",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "candidate",
      "discriminator": [
        86,
        69,
        250,
        96,
        193,
        10,
        222,
        123
      ]
    },
    {
      "name": "counter",
      "discriminator": [
        255,
        176,
        4,
        245,
        188,
        253,
        124,
        25
      ]
    },
    {
      "name": "poll",
      "discriminator": [
        110,
        234,
        167,
        188,
        231,
        136,
        153,
        111
      ]
    },
    {
      "name": "registerations",
      "discriminator": [
        240,
        167,
        231,
        14,
        202,
        236,
        249,
        139
      ]
    },
    {
      "name": "voter",
      "discriminator": [
        241,
        93,
        35,
        191,
        254,
        147,
        17,
        202
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "pollCounterUnderflow",
      "msg": "Poll counter cannot be less than zero"
    },
    {
      "code": 6001,
      "name": "voterAlreadyVoted",
      "msg": "Voter cannot vote twice"
    },
    {
      "code": 6002,
      "name": "candidateAlreadyRegistered",
      "msg": "Candidate cannot register twice"
    },
    {
      "code": 6003,
      "name": "invalidDates",
      "msg": "Start date cannot be greater than end date"
    },
    {
      "code": 6004,
      "name": "candidateNotRegistered",
      "msg": "Candidate is not in the poll"
    },
    {
      "code": 6005,
      "name": "pollNotActive",
      "msg": "Poll not currently active"
    },
    {
      "code": 6006,
      "name": "pollDoesNotExist",
      "msg": "Poll does not exist or not found"
    }
  ],
  "types": [
    {
      "name": "candidate",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cid",
            "type": "u64"
          },
          {
            "name": "pollId",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "votes",
            "type": "u64"
          },
          {
            "name": "hasRegistered",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "counter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "poll",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "start",
            "type": "u64"
          },
          {
            "name": "end",
            "type": "u64"
          },
          {
            "name": "candidates",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "registerations",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "voter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cid",
            "type": "u64"
          },
          {
            "name": "pollId",
            "type": "u64"
          },
          {
            "name": "hasVoted",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
