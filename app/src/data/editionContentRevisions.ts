import type { CoordinateMigration } from './editionCoordinateMigration'

/**
 * Editions whose paragraph structure changed in an accepted release, and the
 * published coordinate maps that carry saved reader data across the change.
 *
 * Every place and highlight written for these editions is stamped with the
 * current `after` hash, so migration runs once and is idempotent. A record
 * stamped `before`, or unstamped and older than `releasedAt`, was written
 * against the old text and is moved by the map; an unstamped record at or
 * after `releasedAt` came from a reader already showing the new text.
 *
 * The maps are fetched only by readers who hold data that needs moving.
 */
export interface EditionRevision { before: string; after: string; releasedAt?: number; previous?: { before: string; releasedAt: number }[] }
export interface ContentRelease {
  revision: string
  releasedAt: number
  editions: Record<string, EditionRevision>
}

export const CONTENT_RELEASES: Record<string, ContentRelease> = {
  'oedipus-rex': {
    revision: 'text-2026-11-18.oedipus-rex.1',
    releasedAt: Date.parse('2026-11-19T07:00:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-01).
        before: 'f96170b779e2c9faf1050b0ad4fa43222dc42ab4f96b2b58a5c372e09dc21281',
        after: 'bff7b3623105bcdab947887fe96a9d345b1f181047babca3d7f98753e3092cb0',
        releasedAt: Date.parse('2026-11-19T07:00:00Z'),
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-01).
        before: 'bd607d8644de54d136ec2b81a65dcfc6050963d959b09d745ee850ada8a1537a',
        after: '08d3761beed61d8f6c5c447c4c6947965e608470aab4f5aaa69a85715beed4a6',
        releasedAt: Date.parse('2026-11-19T07:00:00Z'),
      },
    },
  },
  'oedipus-at-colonus': {
    revision: 'text-2026-11-18.oedipus-at-colonus.1',
    releasedAt: Date.parse('2026-11-19T07:00:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-01).
        before: '5c18460809bf2eacfd1d3f17e5f31b7959f2fada81ddccc59a3588ba92683a7b',
        after: '504bfd4b248fbcd28039960c0317971f749e8ae53c9da2579473313aef55fbdc',
        releasedAt: Date.parse('2026-11-19T07:00:00Z'),
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-01).
        before: '04a3c0a06f626a6508b1ae3d03b53acb4bb1016e26e964437b4bfda007c44885',
        after: '0f0138a4c905e8cc093cf39816800ff4451c0c97d6a4a9b16310f63e23c72e09',
        releasedAt: Date.parse('2026-11-19T07:00:00Z'),
      },
    },
  },
  'frederick-douglass': {
    revision: 'text-2026-11-18.frederick-douglass.1',
    releasedAt: Date.parse('2026-11-19T07:00:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-01).
        before: '695db129557f339345670d8ea3abeceae6625101d91c530891ee303fe8321b0b',
        after: 'd2a317207f5b82fd244eeb586063311bf431f57397439f7231424253e90755cc',
        releasedAt: Date.parse('2026-11-19T07:00:00Z'),
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-01).
        before: '45495079dc5f8ac4ce50d97bd56b9d4eab9f8117cf6218e85f114daa56a33bfe',
        after: '3daadad3e856be1d3eddc253d42e92e5d3b4414726e32517b3b768b4d138bd4b',
        releasedAt: Date.parse('2026-11-19T07:00:00Z'),
      },
    },
  },
  'frankenstein': {
    revision: 'text-2026-11-18.frankenstein.1',
    releasedAt: Date.parse('2026-11-19T07:00:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-01).
        before: 'a99352b3bf5f9d1f7a78970b658f2a35722a2b5031d4037a398d284c6ab390ff',
        after: 'c497bc60fc7ad0ffc6de74df2c47d7eace252f5c27243c36010183756d706cd0',
        releasedAt: Date.parse('2026-11-19T07:00:00Z'),
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-01).
        before: 'f52630181990e7aefcdbd89f4cf76ae1f25e1c336108f8c76b8796b4ecdeeda9',
        after: 'e6081d9a3c54cb55edf800d8f56c2573bf881224992ffdcc2255556572d11dff',
        releasedAt: Date.parse('2026-11-19T07:00:00Z'),
      },
    },
  },
  'candide': {
    revision: 'text-2026-11-18.candide.1',
    releasedAt: Date.parse('2026-11-19T07:00:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-01).
        before: 'e7fd2a802ac233b8598ddccbb03cef8a4fc422fba2d67f6aa0387bee80ba2b25',
        after: '2c4c48b957428ba8a801f224863613127b35684a112778c6c11663ed492de1c6',
        releasedAt: Date.parse('2026-11-19T07:00:00Z'),
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-01).
        before: '5d461138e1b097dd40dadb76aedf108ec8e7efea4f19eb3d935af20a44d4e90d',
        after: 'c6216fed5f3e07bf004b74043c2540bfcc641789776a7f9d4d8769a429de10b0',
        releasedAt: Date.parse('2026-11-19T07:00:00Z'),
      },
    },
  },
  'antigone': {
    revision: 'text-2026-11-18.antigone.1',
    releasedAt: Date.parse('2026-11-19T07:00:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-01).
        before: '923ec3c1b9bcc3e1c2ddeeae4b6e65e4a1dfd72a425f769f02ff12565cdd05ff',
        after: 'b6fe87351be805a9f9aa384cd298cf71066e4df1b0f23531eab27c6fe03f4c6b',
        releasedAt: Date.parse('2026-11-19T07:00:00Z'),
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-01).
        before: '5bfac8c577539e955a8375d4d5db11ff1e4e46e98d47fcdb564f79cee06c5dbb',
        after: 'c3f6b3b066f305d3088835e13a148b6b0b0c7882b1594fa175ff7644f29c086d',
        releasedAt: Date.parse('2026-11-19T07:00:00Z'),
      },
    },
  },
  // Whole text replaced by R. Campbell Thompson's 1928 translation and fresh
  // Tinct modern editions (books/wip/gilgamesh-thompson). Unrelated wording and
  // paragraphing: the maps (app/scripts/build-replacement-migration.py) move a
  // saved place proportionally within its tablet; highlights stay recoverable.
  // The book was held from 2 Oct 2026, so every unstamped record predates the
  // new text; move releasedAt past the deploy time if the release slips.
  gilgamesh: {
    revision: 'text-2026-11-18.gilgamesh.1',
    releasedAt: Date.parse('2026-11-18T23:45:00Z'),
    editions: {
      'original-en': {
        before: '1c9886e2b341187c3dd2b0e4fbcbfc285e65f7631ae6944d094424ac50ef31cc',
        after: '2a91b1e1f3c7180dbb1d02360dceda6c3c7f0ca836685dc40a91fb82c6125b38',
      },
      'modern-en': {
        before: '419a43b05bfcbf84dce9f1948158a8f3d34a4b6dc41c93767c827aede87ad63c',
        after: '1641d807941a9480512f1324869e8abcb635fb31aaff0d2d659eb88985d896d0',
      },
      'modern-da': {
        before: '70a40c3d7e96da38870fda747ccf3d7bd7fb5c111271547fd22ef88385231094',
        after: '3469ed8fc8cc6ccc3f832e01bcf9fa81dfaaa9edac39ddc16c40983535d3aa56',
      },
    },
  },
  'the-prince': {
  "revision": "text-2026-11-03.the-prince.1",
  "releasedAt": 1794579300000,
  "editions": {
    "modern-en": {
      "before": "d99629fa3c3e1a345c92e1b9749115111985bfdff520fd7a37037d6a3731d582",
      "after": "14393ff56819809a54f9f69662249b0182771339103f977092a817510aaae9a5"
    },
    "modern-da": {
      "before": "4d0efe429d27e14db2f05745acc240fadc7e9cb32d237b5e33297c5d154d61a9",
      "after": "3b4a608cb0c5bb122e0dd4b1120188ade53b61f067f9975317102cf1221d5268"
    }
  }
},
  meditations: {
    revision: 'text-2026-11-18.meditations.1',
    releasedAt: Date.parse('2026-11-13T13:45:00Z'),
    editions: {
      'modern-da': {
        // Danish revision, 13 Nov 2026 (modern-da-quality package).
        before: 'c8abc04f4a30589f29c202be7182d220a0ff76b7165c674400884c0c3cfd773c',
        after: '2cbd0ad0a098c1a1c41b1be2d48f33eea585f75d6537652c0be0084403f5145a',
        releasedAt: Date.parse('2026-11-13T13:45:00Z'),
      },
      'modern-en': {
        // Recovered English repairs, 18 Nov 2026 (danish-recovered-batch-04).
        before: '4623d1191fbd1c09f9257acf7e73b49d5467e35fa0d9979e35c910bb24b9cc9f',
        after: '7537097e54b9f2c46514847ad69862cefce2fbfd039368718570644f766eb013',
        releasedAt: Date.parse('2026-11-19T08:30:00Z'),
      },
    },
  },
  'ivan-ilyich': {
    revision: 'text-2026-11-18.ivan-ilyich.1',
    releasedAt: Date.parse('2026-11-13T13:45:00Z'),
    editions: {
      'modern-da': {
        // Danish revision, 13 Nov 2026 (modern-da-quality package).
        before: '7b420f9e7d3d8a477ae024fb20aa0f8746a62aeec9839c42e007e0af9098093a',
        after: '3bbf6181daf6e268093ca9601e00b4b986585b789114b149221d88945d3246ac',
        releasedAt: Date.parse('2026-11-13T13:45:00Z'),
      },
      'modern-en': {
        // Recovered English repairs, 18 Nov 2026 (danish-recovered-batch-04).
        before: '1bb15d1bc0758feadd7ccd239ecc5f8b87d53b9676915d4b3e222d9235e0d5a6',
        after: '319f97002f1336873ee19c404e62614437cf57cd64db46862ee8443c6e6826d2',
        releasedAt: Date.parse('2026-11-19T08:30:00Z'),
      },
    },
  },
  werther: {
    revision: 'text-2026-11-18.werther.1',
    releasedAt: Date.parse('2026-11-13T13:45:00Z'),
    editions: {
      'modern-da': {
        // Danish revision, 13 Nov 2026 (modern-da-quality package).
        before: 'e97c294c690fe118eb1a5556a5b399de7a1a7689f658a650d25deebb2b446916',
        after: '71a255b799d50b1e048a6302ae5058e837e7859e9cc4ccc356000d1be2b25627',
        releasedAt: Date.parse('2026-11-13T13:45:00Z'),
      },
      'modern-en': {
        // Recovered English repairs, 18 Nov 2026 (danish-recovered-batch-04).
        before: 'f45d353204e356b34bd473e250ed557c8ec899d83cfd8076aeb7ee16b1a05bc0',
        after: 'fa7e342d335bd8e91fba28fbcad81820b180788a78bac1837a4c43097bf71386',
        releasedAt: Date.parse('2026-11-19T08:30:00Z'),
      },
    },
  },
  phaedo: {
    revision: 'text-2026-11-13.phaedo-da.1',
    releasedAt: Date.parse('2026-11-13T13:45:00Z'),
    editions: {
      'modern-da': {
        // Danish revision, 13 Nov 2026 (modern-da-quality package).
        before: '087b269dcd42ffb7d3677cb5bf78d9a3bc06e7602b8020467f17e1777d096e93',
        after: 'fcf25859f3c7c690aa9edcfd11e1e4077d4ba7aa9260629462e8331f83eacb11',
        releasedAt: Date.parse('2026-11-13T13:45:00Z'),
      },
    },
  },
  'descartes-meditations': {
    revision: 'text-2026-11-13.descartes-meditations-da.1',
    releasedAt: Date.parse('2026-11-13T13:45:00Z'),
    editions: {
      'modern-da': {
        // Danish revision, 13 Nov 2026 (modern-da-quality package).
        before: '1327a6cd7eed7244bbb345cb49a1972debf6fabbb84bcc37762255969f6627d6',
        after: '1200b5db1b31c45270899db9096fa4164a76dc5a75b95ef7c3e0a5b44ffcb876',
        releasedAt: Date.parse('2026-11-13T13:45:00Z'),
      },
    },
  },
  'us-founding-documents': {
  "revision": "text-2026-11-02.us-founding-documents.1",
  "releasedAt": 1793646717234,
  "editions": {
    "modern-en": {
      "before": "4c6888a7cc0b24e1fa68f8781b71d052243828710063173f634c2ef8dcd8873b",
      "after": "488c6a486b89d577c24d629e8118f1854c95134565a5687b12d758ca5a2929e4"
    },
    "modern-da": {
      "before": "cfd2e1fea563365957e0dabfc5eb9523b86e07a46f6518fddb60afc6ee315527",
      "after": "369bac28503274314566ac6877ae04ea55ec4b39ef7ed3d00f3a0dbf501a6123"
    }
  }
},
  apology: {
  "revision": "text-2026-11-02.apology.1",
  "releasedAt": 1793633331986,
  "editions": {
    "modern-en": {
      "before": "f09399f0fe5348b3e3e809044f9907175515d9a6b113edd1dadd6a98a2444e4b",
      "after": "21e09965eefab651eb1eb4045ccbbb66f72d1c84413589dc656f3c8687a23320"
    },
    "modern-da": {
      "before": "7478955a3818154feab390f4c2768009dd40e064105d55f91ae4cdf03ed80795",
      "after": "69f4b9ca50149d0bb180a86f3e5548448808eb038e559b9575a47e6f5cc3c60f"
    }
  }
},
  'grimms-fairy-tales': {
  "revision": "text-2026-11-02.grimms-fairy-tales.1",
  "releasedAt": 1793631455416,
  "editions": {
    "modern-en": {
      "before": "679ab684eaf90eb7cfdd30a869d97f865aba6e0c5aff77951386ca16c7eba6ab",
      "after": "a2d68274da2776b661efdc9d84719935e910282ae9790cc051290e296cf84441"
    },
    "modern-da": {
      "before": "3137f397a01f59f500c0666caad9d89c33a421523e53579ac0019ea413052452",
      "after": "7e979a057f1a24ec23706c8bd408613bec5ef7310a2375925b67fc29b5621487"
    }
  }
},
  crito: {
  "revision": "text-2026-11-02.crito.1",
  "releasedAt": 1793626567485,
  "editions": {
    "modern-en": {
      "before": "5ff432e7e028e7caff6b11984a50ca0db43f3ce976b68af8f5466f7f23293add",
      "after": "241326ee42ee5c457192a91961a6d276c5add7b09304eda987a2cca562d44d89"
    },
    "modern-da": {
      "before": "4f2aa8b2b6f2c8b36d90026c6e563015d6599f89595dc5f8c56960ade78d1237",
      "after": "d91a71009bd515eb1fa5cab47415224fc588a28b2b8e8644c6a6a886c60dd12d"
    }
  }
},
  'the-manual': {
  "revision": "text-2026-11-02.manual.1",
  "releasedAt": 1793625566583,
  "editions": {
    "modern-en": {
      "before": "2ac0db1347defd5bea73e993f4db672a37136f53bcf69423dab544de20040f35",
      "after": "440a9f9abcb899abbffee46275c06b9c360b0e5d9692db0e459534cb8cb10493"
    },
    "modern-da": {
      "before": "08b3e433b8b9c74cc6ee9d72c8cff97502c1095ab827e9c09ffd290e93c83879",
      "after": "4d5e4e5a1ece8ed79b1f980e9d7e1219ea84938bbdc2dac4eeab6cb5789947cb"
    }
  }
},
  'aristotle-politics': {
    revision: 'text-2026-11-18.aristotle-politics.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-da': {
        // Danish revision, 13 Nov 2026 (modern-da-quality package).
        before: '57d699612aa360b08a72c2a5c6c800e0eae6c838b69f91a648295c389d1865fa',
        after: '2dea810ddab3a318e58387d35e31cfa2d7e64e87b432f8e66dd238bd760270bf',
        releasedAt: Date.parse('2026-11-13T13:45:00Z'),
      },
      'modern-en': {
        // Recovered English repairs, 18 Nov 2026 (danish-recovered-batch-04).
        before: 'eec87f405113c665c38fd1edfc940a94c524c2c631a09c652e7fb21c0c05e511',
        after: '42af363809c2be2b66482d3ddbbe6c7330badd514cf2d264a9a8152a1ff2ea89',
        releasedAt: Date.parse('2026-11-19T08:30:00Z'),
        previous: [{ before: '8ce0b1f6570584b4ba8168b25cb6ae365afcd0cc157cc4a0f15cd2d3efc62224', releasedAt: Date.parse('2026-10-01T09:00:00Z') }],
      },
    },
  },
  'beyond-good-and-evil': {
    revision: 'text-2026-11-18.beyond-good-and-evil.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: 'e523d52b006da0963c0956cca1aa808145d62238db2686cf415a95ed7d849eb0',
        after: 'd017ff076cbbf10f7aa9002fb77818fbedeaa551ecbc39fa336330d68a4f116a',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
        previous: [{ before: '5b14eaa83a4b695afc10e74b203001ac33490f732a1fb42c141749687859d08a', releasedAt: Date.parse('2026-10-01T09:00:00Z') }],
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: 'ee3d488e2e798a6ab56dd102f7d3dfbc32b02d475966f6549a781acd38451646',
        after: '289caa432f9c9a10a281233ef2baeec8de417bef4bcbb9c16dd06f2a8904a2e4',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
      },
    },
  },
  symposium: {
  "revision": "symposium-completeness-2026-09-25.1",
  "releasedAt": 1790362800000,
  "editions": {
    "original-en": {
      "before": "e2943777fd54eaaa0888076c5c03a9104bc1b1ffa681a5362ab114e327f797c0",
      "after": "3521a12d5d5acd6d4ac83f53747192c5ae592f7bf5e965c9c9bff881965495a6"
    },
    "modern-en": {
      "before": "7816d1eb6ac9cc6d178c4c123bbeb8ad6daced1f7d7fc8c036f2bded3b8fcce8",
      "after": "1e970b7beb3f098095ecf1a9fc7d78a8855d75e6ffc3bba14edc69db0e05374f"
    }
  }
},
  'jane-eyre': {
    revision: 'structure-2026-09-24.1',
    releasedAt: Date.parse('2026-09-25T12:00:00Z'),
    editions: {
      'original-en': {
        before: '055aad5e04c0c9dbb32969c57cbcc54aa5e00c012256cd3debbce0577cbe5f96',
        after: 'd05d18103f439a8267be407ac8e6d44068236c262321f386174050bbf2109257',
      },
      'modern-en': {
        before: 'bbfe4c30163ecf07291e2fa5faef69d1e57348644afe2ab0dfc96edff3cecad0',
        after: '0488dac58943afde5be0b7e1105206429e2fc0a887462ff753057081e096dff6',
      },
    },
  },
  // Text-only repair: paragraphs unchanged, wording new (Tinct Modern English rewrite).
  confessions: {
    revision: 'text-2026-11-18.confessions.1',
    releasedAt: Date.parse('2026-09-25T12:00:00Z'),
    editions: {
      'modern-en': {
        // Recovered English repairs, 18 Nov 2026 (danish-recovered-batch-04).
        before: '949e4f77fd317601cc39dc701cfbc3f5f82a5b5a842c34e93c9a6328ef78add7',
        after: '3c87df8707457b72407c0f21b5a6669e73b7116fc7a60621bf9d8a2025d7c196',
        releasedAt: Date.parse('2026-11-19T08:30:00Z'),
        previous: [{ before: '420b17153b6cb46f6a74e41bb633dcbc88099975720dac27c6bfb0bf6be51b4e', releasedAt: Date.parse('2026-09-25T12:00:00Z') }],
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-04).
        before: 'ac1dfc10a1001442f868a76c722ca2cfe07b833d0ea2b75eaf83d76284d66176',
        after: '5028babb2b550a190e00e94eaf33ecee0c0aa2d647bafd51d03115714c1264f1',
        releasedAt: Date.parse('2026-11-19T08:30:00Z'),
      },
    },
  },
  // Recovered Middlemarch Danish and English repairs (danish-recovered-batch-04).
  middlemarch: {
    revision: 'text-2026-11-18.middlemarch.1',
    releasedAt: Date.parse('2026-11-19T08:30:00Z'),
    editions: {
      'modern-en': {
        // Recovered English repairs, 18 Nov 2026 (danish-recovered-batch-04).
        before: '304f7ac56d6def7c254fc2eeae95ce18c75a36329e8a722c484dfe0f5b52182e',
        after: '8db8425a80483ade3621e983bab6a2dadcb3bca7c4d54492f59408668c4698d5',
        releasedAt: Date.parse('2026-11-19T08:30:00Z'),
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-04).
        before: '964adedfdf3613fb95bf14e6b8623092d5d74090ff102933ab9a12afe536a3fa',
        after: 'b79a62d383b199b8475946a336c61e6b33b373e879cbef0c390e8928e8553a5e',
        releasedAt: Date.parse('2026-11-19T08:30:00Z'),
      },
    },
  },
  macbeth: {
    revision: 'macbeth-completeness-2026-09-30.1',
    releasedAt: Date.parse('2026-09-30T19:04:00Z'),
    editions: {
      'original-en': {
        before: '2650bcc666428a808584fd6f99534f71474a4e99a085c7ae6b87234e24e30608',
        after: '9df987bdf1a1a8c50d44e0c4c2ab6a18e2580f47114810232e8022eecca207c6',
      },
      'modern-en': {
        before: '0c85273086804fdd02abee81842de15338b61a2288bb26805e9b2f2d505d02f1',
        after: 'c597a985ce096a923b03a5072e52f6d8bd5bbc44c0c11fd924ff4e0019351bec',
      },
    },
  },
  'as-you-like-it': {
    revision: 'as-you-like-it-completeness-2026-09-30.1',
    releasedAt: Date.parse('2026-09-30T19:04:00Z'),
    editions: {
      'original-en': {
        before: '2c04249b4ea528612cfa8f41031ed7a78fff2e453f15fbccf7d55f03905ce179',
        after: '8ab533a42958f570a59d12e686793d4397ff0efe6c9b061acfb468d645254358',
      },
      'modern-en': {
        before: 'df270fa2b605950982107d654d395fe0eaa0226208f9a5b185d06d7da2b5f8e4',
        after: '5a4e95bbf50e3affb4581cc5acd53d19322642e81894342bc56bd03fc7f75e48',
      },
    },
  },
  'faust-part-1': {
    revision: 'faust-part-1-replacement-2026-09-30.1',
    releasedAt: Date.parse('2026-09-30T19:04:00Z'),
    editions: {
      'original-en': {
        before: 'bff236838e6e5ee6baeb7afd16c6b1c1b2872f87605f21e79e4cd5198a997395',
        after: 'e36200c60fe9e763555461ea2d65f9772058aa737635688e7b79ad4010bee79d',
      },
      'modern-en': {
        before: '9e66da5b45267bfb3cae70905897d9f9c1397bd1d1c8b080bf325cda0046d28b',
        after: '7c7b27df8c77e069e8641b8154f67f26d57afab36d73072865d061998d201dfe',
      },
      'original-de': {
        before: 'edb0081f759c0eb256ed303711932af743784a87f1cc6716dab7d15365bc83e5',
        after: '3e69f81d08d33c8b3aae0d7c1c7b05757f6944317ba68ff754a0f2aaf4b2f66c',
      },
    },
  },
  jerusalem: {
    revision: 'jerusalem-completeness-2026-09-30.1',
    releasedAt: Date.parse('2026-09-30T19:04:00Z'),
    editions: {
      'original-en': {
        before: '747b53bedd58d9ba65877185247a8545dac4bddcd1e8219cf5315da00cdac47c',
        after: '20d0ed3ecce5e4b440fec2e4373b337222c6a734f37f9cf769d94cecc248c48a',
      },
      'modern-en': {
        before: '6cdbf3a5904a26d5edffc0ad45325f29af16e8cd6bc0a959f92450c3b33c00ee',
        after: '47c0c1c78ef4b342c793f7ffd07dabbbe96334c67d7ca85dbfa9aafdf9f521b0',
      },
    },
  },
  'vindication-rights-of-woman': {
    revision: 'text-2026-09-30.1',
    releasedAt: Date.parse('2026-09-30T19:04:00Z'),
    editions: {
      'modern-en': {
        before: '4e7e6143670a4ca29fa6f004587578e56102ac7b2f1b00814ddefb303084ba63',
        after: '6a398f5b8be7c85ad6fafa8d1e414674bcd7f193daf129844b83ada8f9cb056a',
      },
    },
  },
  'second-treatise': {
    revision: 'text-2026-09-30.1',
    releasedAt: Date.parse('2026-09-30T19:04:00Z'),
    editions: {
      'modern-en': {
        before: '177b364414c437af89fe5d09b8922d71ff772ccf7da6ec2e64c710ed061269bf',
        after: 'f6799fa25a28d93cec6029b76e929c788c4d123d02450b517fd128c3a73e6dd2',
      },
    },
  },
  'moby-dick': {
    revision: 'text-2026-09-30.1',
    releasedAt: Date.parse('2026-09-30T19:04:00Z'),
    editions: {
      'modern-en': {
        before: '2ab04dd727bbe5804b7acf1d05f578cfed5aef17c08d7d72b6db9101f8c1763c',
        after: '1a3f31bbe6bb4bea415a29b509c81f303074bc858854c7bc00a49e8b68ffd52c',
      },
    },
  },
  'fear-and-trembling': {
    revision: 'fear-and-trembling-structure-2026-09-30.1',
    releasedAt: Date.parse('2026-09-30T20:25:00Z'),
    editions: {
      'modern-en': {
        before: '152776f19e1b707b610d2bee033d6984ed0f1e26826b314e2d0541d9c0b49132',
        after: 'c48a325258381311e61ff70a2c9a3972e5e75cc1dac2b9b357e7022f85111fb8',
      },
      'original-da': {
        before: 'c61144bbf51a930748799d4ff30ff48031ee12452ada5eb5391f684e8961d63a',
        after: '290fec6aa962cce75058c7c0286cc9a4c9aca00066be5cb535d528b7af2b8934',
      },
    },
  },
  'communist-manifesto': {
    revision: 'text-2026-11-18.communist-manifesto.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-04).
        before: 'c4798893134511db4e2479af47f07436f2f73db2aadcc040048cff0e9cd84698',
        after: '37f25a8c20457038539a95a416aaf8972954a6780ea7a6f8abe9f0749d6b638d',
        releasedAt: Date.parse('2026-11-19T08:30:00Z'),
        previous: [{ before: '6c4fafb667b40f265943a6bb531a4246a92f7c47192c0e2247abc1e6a7c5485e', releasedAt: Date.parse('2026-11-13T13:45:00Z') }],
      },
      'modern-en': {
        // Recovered English repairs, 18 Nov 2026 (danish-recovered-batch-04).
        before: '5cccffe12e998383856f3d80ba64eddfb5371bbfe0b01cf04d0df503fe6760eb',
        after: '9d8c931d1b35a483d17c990fa77bae81ace9d33706cbdba7ce184e149056cbf6',
        releasedAt: Date.parse('2026-11-19T08:30:00Z'),
        previous: [{ before: '909c7496f66b1314666a2053ca056d1f2defc2cdf50ad44719208b38c153fc62', releasedAt: Date.parse('2026-10-01T09:00:00Z') }],
      },
    },
  },
  // Text-only modern-en repairs (2026-10-21): paragraphs unchanged, wording new in the changed paragraphs.
  utilitarianism: {
    revision: 'text-2026-11-18.utilitarianism.1',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-da': {
        // Danish revision, 13 Nov 2026 (modern-da-quality package).
        before: '46ed443acf9c23bbce899a7a2b67b938192b6e4f6f1828e165e27594dc21cc94',
        after: '4c4f8541617137907aa7ddc4c7c1de06a3958b4027c2646c10a6e914595e1758',
        releasedAt: Date.parse('2026-11-13T13:45:00Z'),
      },
      'modern-en': {
        // Recovered English repairs, 18 Nov 2026 (danish-recovered-batch-04).
        before: '534c43afa8af1f7dea12997361cd568a0569261d241e72c3fd6f961950a26fa1',
        after: 'a46fa4199e8e4093ccb5c013ed8912f951194d2381bd24b32a1f1973bb6a2360',
        releasedAt: Date.parse('2026-11-19T08:30:00Z'),
        previous: [{ before: '7457e909ce911b5043c692ccf51e7ce30266b5824aec22c10997931dfb737361', releasedAt: Date.parse('2026-10-21T12:00:00Z') }],
      },
    },
  },
  poetics: {
    revision: 'text-2026-11-18.poetics.1',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-da': {
        // Danish revision, 13 Nov 2026 (modern-da-quality package).
        before: '98b7db8373b61d59aaecb9a77afb2241f163245b76ac692cf9cda44185d61ee9',
        after: '4a6d7e49f024c2ea7da2697da770aca89b224c20d1f9c1d4209cc3f33df784e5',
        releasedAt: Date.parse('2026-11-13T13:45:00Z'),
      },
      'modern-en': {
        // Recovered English repairs, 18 Nov 2026 (danish-recovered-batch-04).
        before: 'c14bf2d099284fad9b2801ba2272ef92ce9be3ba3e1eb43dfa789febd2f17323',
        after: 'd74a723c742c3b2b7beddbfcc80f80c080389f443aefb479e3fd662095bf6e63',
        releasedAt: Date.parse('2026-11-19T08:30:00Z'),
        previous: [{ before: '20c7f0695e0360b9ea800ae11c0720bfe38d1e7e85b828d0a19bed542a9b175e', releasedAt: Date.parse('2026-10-21T12:00:00Z') }],
      },
    },
  },
  'genealogy-of-morals': {
    revision: 'text-2026-11-18.genealogy-of-morals.1',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-01).
        before: 'f108ea298f97f055749347e71a5bfbe55398409c79b4162e7691735331677c6f',
        after: '19f61cb36d682f16612d45fad0e21df3efb5374027ce4de3f354d5dfadb3eceb',
        releasedAt: Date.parse('2026-11-19T07:00:00Z'),
        previous: [{ before: '72ca79453b9a485fa0a8277df452809dba80b87ecaf6985121e020ef51d30a9c', releasedAt: Date.parse('2026-10-21T12:00:00Z') }],
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-01).
        before: '4e1dc72f97f6c9ac48a3d65e98f1de0f0d85d6f7bf3d3f03083c2299b2b9e71e',
        after: 'ce64080afa9ae08ae6418eab8b81dcaa56dc799b3cd022b31fe760817b94bd2e',
        releasedAt: Date.parse('2026-11-19T07:00:00Z'),
      },
    },
  },
  'kant-groundwork': {
    revision: 'text-2026-11-18.kant-groundwork.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-da': {
        // Danish revision, 13 Nov 2026 (modern-da-quality package).
        before: '1ec3983ff14eba1aed249aae2c85a4c53fb79546a8db14acdd3b2b82a5039da6',
        after: '85cd0b815b9bccf03a0b1db825a9eb1281f2aba7a6bc948bda27fc8737ae0d5c',
        releasedAt: Date.parse('2026-11-13T13:45:00Z'),
      },
      'modern-en': {
        // Recovered English repairs, 18 Nov 2026 (danish-recovered-batch-04).
        before: '57c821d775792c3950f94a6d394e0d556310b21422e2c3bb2e6b63e77b249a9d',
        after: '49e357fe69f5a375f9cee57bc32f6e70c597671c632800ecf3590d6dc70731e5',
        releasedAt: Date.parse('2026-11-19T08:30:00Z'),
        previous: [{ before: '2ac2fce500388299d084ecf5b8e3be84c6f06bfc3747aa7262a4bacc7459d84d', releasedAt: Date.parse('2026-10-01T09:00:00Z') }],
      },
    },
  },
  // Text-only modern-en repairs (2026-10-21): paragraphs unchanged, wording new in the changed paragraphs.
  oresteia: {
    revision: 'text-2026-11-18.oresteia.1',
    releasedAt: Date.parse('2026-11-19T03:00:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-03).
        before: '861b154ade47183257f3bfe4e503fa758404a0e421659baa246840e3eb1aecfd',
        after: '031fa843b02a5937348da0c84993219ffcf46686dd5ce8d94b8950b98b6e6a2a',
        releasedAt: Date.parse('2026-11-19T03:00:00Z'),
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-03).
        before: 'c131aa0ae927e741d6f08a78a042aa5c0fee844ab0d9c765b0eb54774c053f3c',
        after: 'd8a3cab5a1f7efcc046d7df901e6959e25e2e0a9ee8ed43d7ff064230f292e93',
        releasedAt: Date.parse('2026-11-19T03:00:00Z'),
      },
    },
  },
  'the-aeneid': {
    revision: 'text-2026-11-18.the-aeneid.1',
    releasedAt: Date.parse('2026-11-19T03:00:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-03).
        before: '1e9b6dd64911f96374ae6e9322379d4eb30a9d9dfc8e0a994e717c71f3a05c07',
        after: 'd31476703adeb70dfeab3175b07239a6270dc503fd3a00b96ca9300ef6cf689a',
        releasedAt: Date.parse('2026-11-19T03:00:00Z'),
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-03).
        before: 'ed6ef13cbfdd867014f73b37289032705160a65f17e6d116761ee446abc9b9b8',
        after: 'fe9fba5bf0a06d936c7b2823540ee1bd0c4c4e3347a2d18611351124122ce788',
        releasedAt: Date.parse('2026-11-19T03:00:00Z'),
      },
    },
  },
  'war-and-peace': {
    revision: 'text-2026-11-18.war-and-peace.1',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-03).
        before: '65c253aa95e1e4cb21112e5d4aec5344364cd658a596264710d5b48d2bacfcd8',
        after: '339afb941e00b25a437c5215828d8a162c1e1912790c21fd3f25afc34c794460',
        releasedAt: Date.parse('2026-11-19T03:00:00Z'),
        previous: [{ before: '93fb7594ee1e617095818f93da10ed3fbdc0d0e6abcf76280e0fb1ee3097e496', releasedAt: Date.parse('2026-10-21T12:00:00Z') }],
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-03).
        before: '773c92e1606817232ae7381f79df9a6bb074384397e0583b5b60e6ddd3c9d140',
        after: 'b88d668b78066fb8c3119bbeaf42313d647fc58143a5f2a5e42aeb94a1cf9749',
        releasedAt: Date.parse('2026-11-19T03:00:00Z'),
      },
    },
  },
  'democracy-in-america': {
    revision: 'text-2026-10-21.6',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-en': {
        before: '347cc8f0729f7fe0520163d153554a78e36d82e87b8c59777f4745a74e545662',
        after: 'cfd05256d4621d8a9f803ec1ede208469bc051ea3ed9a0ef508feea7caba6eb6',
      },
    },
  },
  // Text-only modern-en repair (held from text-2026-10-21.5; names fixed): paragraphs unchanged.
  // releasedAt is past the deploy (released 20 Nov 2026): unstamped records written before it are migrated.
  'peloponnesian-war': {
    revision: 'text-2026-10-22.1',
    releasedAt: Date.parse('2026-11-21T00:00:00Z'),
    editions: {
      'modern-en': {
        before: 'c035038d032ca4ec110b18df43b68d5a15c33cfef7c934170699a51313b90f75',
        after: '200accc13036976e0cb5c4fcaddcf3e6203feff9d9a80aa4e9279ef7c2d08081',
      },
    },
  },
  'notes-from-underground': {
    revision: 'text-2026-11-18.notes-from-underground.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '8df3e74890b26ce3febb108540f3a7a32fd3afdc93b1d047cbe6b053793a0449',
        after: '401a1e58e4ff88897bf83a999172e8072dc774ca209e5131ce2d31a1a2332530',
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-01).
        before: '5654b6b12c596775fe92516cbf5c5c609087cbb787987870548fcd8159cf96fe',
        after: 'a2b99346d4852b2345442d9bec04538eac00268a566dcbd3d91c015d8ff09a18',
        releasedAt: Date.parse('2026-11-19T07:00:00Z'),
      },
    },
  },
  'heart-of-darkness': {
    revision: 'text-2026-11-18.heart-of-darkness.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-01).
        before: 'abcf3c20a7d0b42c15ad3196032cea5a14a113f8cecea35c70d5af8023d4aebf',
        after: 'e631c9d999c9cfaadd245049f768917beab19374b59c56fede8acf43c8777a76',
        releasedAt: Date.parse('2026-11-19T07:00:00Z'),
        previous: [{ before: '169c288c26f0c8c07be6d181855123cd982023a0b780262576944f5833afa435', releasedAt: Date.parse('2026-10-01T09:00:00Z') }],
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-01).
        before: 'b0d43952a120819a451538113d82947f922ddaba0535257fb19bd909ba834444',
        after: '47ec0ed6c5ff447a6c2a2b464a5b107a7414e9121330a6eb43cf76244720191e',
        releasedAt: Date.parse('2026-11-19T07:00:00Z'),
      },
    },
  },
  'jungle-book': {
    revision: 'text-2026-11-18.jungle-book.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-da': {
        // Danish revision, 13 Nov 2026 (modern-da-quality package).
        before: '3e63c88be5d4ea74e09498608ba267fcee9d20f1293851584983299ced54470f',
        after: '38ed0329dcd2cc276c51c3149e264c51430826336fca965e7ce329cb06b00f73',
        releasedAt: Date.parse('2026-11-13T13:45:00Z'),
      },
      'modern-en': {
        // Recovered English repairs, 18 Nov 2026 (danish-recovered-batch-04).
        before: '9eaf20289bbc99281feeae0310ffb4f434c6808c6943b986df07722dcd9debd0',
        after: '3ab69e13379c0c3dd42d7f9d661d4641fbdbc460bbccf63b08e7dc499e0aae41',
        releasedAt: Date.parse('2026-11-19T08:30:00Z'),
        previous: [{ before: '821357c6bb7dc016b819f89fd9f857ffcc78b057f5718cf0e66068b3f249c640', releasedAt: Date.parse('2026-10-01T09:00:00Z') }],
      },
    },
  },
  'hume-enquiry': {
    revision: 'text-2026-11-18.hume-enquiry.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-da': {
        // Danish revision, 13 Nov 2026 (modern-da-quality package).
        before: '228687c99a0293b8c616763c55a336081117e47d5154ae2fe79ed86e5aa74f3a',
        after: '26db5929b2988232f5de6b6d074b2a0ffcd49c2e87925e0c4b6216aafba50cf6',
        releasedAt: Date.parse('2026-11-13T13:45:00Z'),
      },
      'modern-en': {
        // Recovered English repairs, 18 Nov 2026 (danish-recovered-batch-04).
        before: 'cd8a4daab2bed38c816b79ca74c7d464bbcce9bcc2ef8e1a9ee1f374f0977633',
        after: '09c385a08b6a1b9bc470f0a1afb604f71e34b363e26bfdc11bbb1ab70971e531',
        releasedAt: Date.parse('2026-11-19T08:30:00Z'),
        previous: [{ before: '8b9b306e32e35f9047f4f5247d07562b601024e014d9e93a373e6104204d3290', releasedAt: Date.parse('2026-10-01T09:00:00Z') }],
      },
    },
  },
  'around-the-world-80-days': {
    revision: 'text-2026-11-18.around-the-world-80-days.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-da': {
        // Danish revision, 13 Nov 2026 (modern-da-quality package).
        before: 'c6c87d873d08fb8dd98d8ab0e48619383dc0f97bab830c412b7c750df4150496',
        after: '202820448ffeab82bcdab08c525204c9a3c366054e330c6138fe4eca9ba1247c',
        releasedAt: Date.parse('2026-11-13T13:45:00Z'),
      },
      'modern-en': {
        // Recovered English repairs, 18 Nov 2026 (danish-recovered-batch-04).
        before: 'a2d94a65fb3f0a3872f105b6300e8c3ab4c61ca0ac84614822a17ff91c05f426',
        after: 'b0ed142aef04c14aa5ee56882a368318834d29338479b07d1a08ed9d1743f303',
        releasedAt: Date.parse('2026-11-19T08:30:00Z'),
        previous: [{ before: '13b90c0526762af96d550fa512941dff043473c31c55efa877bb9465770745af', releasedAt: Date.parse('2026-10-01T09:00:00Z') }],
      },
    },
  },
  'a-little-princess': {
    revision: 'text-2026-11-18.a-little-princess.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-da': {
        // Danish revision, 13 Nov 2026 (modern-da-quality package).
        before: 'ce3adc75e9e7cba629e901c716b551933cd855e06d4cac830d261603dbc62571',
        after: '33f8e5b5a5434ce52ef48ba906d306ef130b43374fb48f72893ae0573598d40b',
        releasedAt: Date.parse('2026-11-13T13:45:00Z'),
      },
      'modern-en': {
        // Recovered English repairs, 18 Nov 2026 (danish-recovered-batch-04).
        before: 'c47540c17dd567bafe0934392b31a8d236e15e809244e419080e8abf3c4fa1b6',
        after: '4af55bb751cefb17c95a2d9cedae337ef1e26660fef67a1e816debca177c69b9',
        releasedAt: Date.parse('2026-11-19T08:30:00Z'),
        previous: [{ before: '5e359e936c37e8e79ea7738597da244b7356369558e59ada48fc0f32fde8a020', releasedAt: Date.parse('2026-10-01T09:00:00Z') }],
      },
    },
  },
  // Text-only modern-en repairs (2026-10-21): paragraphs unchanged, wording new in the changed paragraphs.
  'brothers-karamazov': {
    revision: 'text-2026-10-21.4',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-en': {
        before: '5b2d957d5fdca2f1c6374afe61fd7a3e72e2316f06f5bc1f5796939485f91378',
        after: '0426f2f3629b48a14b9363add7bcc4e7be633b8ac4bdfc29557713bb563aaf0f',
      },
    },
  },
  'niels-lyhne': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '88dc925851aae72fa3602b26917ec696e13a8499117c98298e71c6909f87521a',
        after: '66fe341fd5d74b6d0fbdba1a27b5055ae80175d3615e30cff03a3a85ea1e6c38',
      },
    },
  },
  // Text-only modern-en repairs (2026-10-21): paragraphs unchanged, wording new in the changed paragraphs.
  iliad: {
    revision: 'text-2026-10-21.3',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-en': {
        before: 'd424a2e68fd2e302781a4f2ecd4ce3f85ff84c7b80f35b066a32f342cd59fa75',
        after: '5719267ee36dca311bb8d74f25ff58994b8dd84fb12cd2f958ece794bb5dc880',
      },
    },
  },
  'federalist-papers': {
    revision: 'text-2026-10-21.3',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-en': {
        before: '1974574ebce6859b2c7fdde48b524360b6348e0492e425861e8259076297278d',
        after: '1f123f52d66f4f4df3c4b8e2e47dd8d561bc10fd914c7ef90bed6db51327c7fa',
      },
    },
  },
  walden: {
    revision: 'text-2026-11-18.walden.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-03).
        before: 'e6bfb94a075f25c959e1e97da77200aef84e40cec89dd9450f4a8f26c0a6ab01',
        after: '9ca0743ccc04a0e17e944a78a5269c6d34f0ef1ddbbc1fe3f3ab42e01f7ad0e6',
        releasedAt: Date.parse('2026-11-19T03:00:00Z'),
        previous: [{ before: 'd2d20614cb168f7dac5413213f98d41a9d21bd90ac3126fa592e52b58571f8ec', releasedAt: Date.parse('2026-10-01T09:00:00Z') }],
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-03).
        before: 'a289d165e360133b36b93d897734bdcd46ff440779413d1d6c381ff804aa081a',
        after: '9c500c2a1d9614ffb719f4e702b47466d8c936fe9871fbaefa34a0535c4e02d3',
        releasedAt: Date.parse('2026-11-19T03:00:00Z'),
      },
    },
  },
  // Text-only modern-en repair (2026-10-21): chapters 1, 2, 5, 7, 8 and 9 re-rendered; paragraphs unchanged.
  'jekyll-and-hyde': {
    revision: 'text-2026-11-13.jekyll-and-hyde-da.1',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-da': {
        // Danish revision, 13 Nov 2026 (modern-da-quality package).
        before: '5cf16e3333eefe1e73a96609acf6087e83f7fd726c9f9d2860d5777f7e00e105',
        after: 'e75dd3c83aeebedea8e771685ebdc6614623fe99a010c541448e30951fc73865',
        releasedAt: Date.parse('2026-11-13T13:45:00Z'),
      },
      'modern-en': {
        before: '7bcc0ee81b68635f017b8324fab9dc2e4cc3fc0febb827e0431ce876a2d0ac6b',
        after: '640dc4ea5d7d56f4b015b000404b5275c5cf9223b9979ed6bfb3765155c4883d',
      },
    },
  },
  'on-liberty': {
    revision: 'text-2026-11-13.on-liberty-da.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-da': {
        // Danish revision, 13 Nov 2026 (modern-da-quality package).
        before: 'd6e0ac08b19b767231d3c75a72b1a261e9d27905d63427578dee04a5db92d6e8',
        after: 'e5c88f693a3261252fb08e973d920cfddf8fcb8a828703be216682fa84ca6fce',
        releasedAt: Date.parse('2026-11-13T13:45:00Z'),
      },
      'modern-en': {
        before: '12be1b0b5132554b0e19863654e4c0fa077e0cc267962106ed5e6e80eb6f1ff7',
        after: 'cb1b3de53726abe48a58157067c78c72a7f8c99bc9708ad9a804f485a2d00ebb',
      },
    },
  },
  // Text-only modern-en repairs (2026-10-21): paragraphs unchanged, wording new in the changed paragraphs.
  'much-ado-about-nothing': {
    revision: 'text-2026-10-21.1',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-en': {
        before: '3b92db2e6ffc9d6b06eb0e3e6b15edaba45f2ed3495ddb2cb999c5b10eddf1af',
        after: 'e93fb1e66e2c9dc2d7266357fe143cf44c4943847f81009b9b507425dd2859f1',
      },
    },
  },
  'romeo-and-juliet': {
    revision: 'text-2026-11-18.romeo-and-juliet.1',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: '0f7f2f2fbfb6e17d1c070228df6ec190d05bac150eeb16b1d12dc99a24efe04b',
        after: '0815f11eae139a83040026a059212e8e456751385026bd9863f84dc622454bbc',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
        previous: [{ before: '47fdf4f9a1b309f6747b48d00add73181cff9cd0a4c0063f81774a1a8a95bae6', releasedAt: Date.parse('2026-10-21T12:00:00Z') }],
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: 'bed47cb3281aa1e9f70885921ff6cb79b603f4a5a124e2445c19167778877046',
        after: '8e2afcbef811e606ba4daba0934ff28c567d101c60abf27b87c54e7333ef7506',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
      },
    },
  },
  'the-republic': {
    revision: 'text-2026-11-18.the-republic.1',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-03).
        before: '2bc78ba1f33b207c52ee98dd47954c82c07afb11b3b70d60f6a41af18b675277',
        after: '081dfa1a6bb5669e010888f5a1db5c1794412209796d6c693f5216cffe48264d',
        releasedAt: Date.parse('2026-11-19T03:00:00Z'),
        previous: [{ before: '02082bbef9bf9026cdcdb11c0bc60e0e518a832d63f19dcbcab65ca794078f57', releasedAt: Date.parse('2026-10-21T12:00:00Z') }],
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-03).
        before: '9de2ff16ca374bdbe70339db2067375b7d8c68d6abed6e8edcab10fd50d68859',
        after: '6d4b1b65391afec6a14b1e458064042e7eb2706b1ceae9a91cfd67854151aa51',
        releasedAt: Date.parse('2026-11-19T03:00:00Z'),
      },
    },
  },
  phaedrus: {
    revision: 'text-2026-11-18.phaedrus.1',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-04).
        before: '7577d9822136dcade54ca1d9b1c43d53e6bbd56d33ebd9790912d6c9e9c04951',
        after: '0fe3e60e58846efb19ddbf6d11a7d3bbe838acb64b03cd2a5d837e24eb78626e',
        releasedAt: Date.parse('2026-11-19T08:30:00Z'),
        previous: [{ before: 'f779e3b14e3a18803657bcfde238eb90b554fe67c263e401fc02c0f34fcde66b', releasedAt: Date.parse('2026-11-13T13:45:00Z') }],
      },
      'modern-en': {
        // Recovered English repairs, 18 Nov 2026 (danish-recovered-batch-04).
        before: '5ad44b8b4dbd819c14936e91514f25d8f02a0c81f728ae7d666adaedf8e9575b',
        after: '45a82f434bb42bd8cbe2bcb767484c1c4fb74005a8857458e4b8480b7205cb24',
        releasedAt: Date.parse('2026-11-19T08:30:00Z'),
        previous: [{ before: 'a246a86ca83ff33521735c1ff70681037ed4d956f87e71d0812ddf864979e06c', releasedAt: Date.parse('2026-10-21T12:00:00Z') }],
      },
    },
  },
  // Rights replacements: the whole English text of each book was replaced by an
  // unrelated public-domain translation (paragraph structure and wording both new).
  // The maps are proportional and low confidence: places land approximately,
  // highlights stay recoverable and unresolved.
  'the-art-of-war': {
  "revision": "text-2026-11-02.the-art-of-war.1",
  "releasedAt": 1790863200000,
  "editions": {
    "modern-en": {
      "before": "a19820ebde2ad3a2d0b394cd7dd40e03148584335e46a7846816b352111ce5ce",
      "after": "4572cbf35f7daf2d98f35e87aed5737510706612118d9d3ffe04d427dfdb682d",
      "releasedAt": 1793634976398,
      "previous": [
        {
          "before": "bf41e7a3a441202531c419e259f908a16b2e0f32fc2fd38beef00755e5267cf5",
          "releasedAt": 1790863200000
        }
      ]
    },
    "modern-da": {
      "before": "cf5cc1224f1be2a1214e2e93b0e2f333d38184d11d91593ba37507719c433dcb",
      "after": "82beb558ec7f64151707b72c76f2d7adecbe6eebf0f05b684b9b5af49ce902b6",
      "releasedAt": 1793634976398
    },
    "original-en": {
      "before": "60beeb94051b07312e0c554ce215a73ebc87e503006e7832cba7e09309be1d61",
      "after": "9ff95e59dbabb51833515ba85ecf5eef4d38436afe7601591eeebf847eb4b327"
    }
  }
},
  medea: {
  "revision": "text-2026-11-02.medea.1",
  "releasedAt": 1790863200000,
  "editions": {
    "original-en": {
      "before": "6e6e27372c778b45fc9512196746a88cf8c3bbbdcd67ab0cf4145c9e3df01731",
      "after": "f988ee4537a1b824f9526c580d8cb1fb7bc11315e16b6aff9177f91c00b5f3bb"
    },
    "modern-en": {
      "before": "573e56ea9bf089db0c9340edd70034a37e78ac4a07e9ca868ff11e5ca96a7e7b",
      "after": "63964726748e98d1a7cd465f68cbb4663f395c0e552879a54c8c2d065a8f6514",
      "releasedAt": 1794579300000,
      "previous": [
        {
          "before": "2d30ac0eb7fa802a6e5eef0b25e921ed119ef97a12d99622c118afac3978b3ae",
          "releasedAt": 1790863200000
        }
      ]
    },
    "modern-da": {
      "before": "5f7d1fa5c4013fd9482cd4ee4e1ecfa68fafcdbf0911cfda5516b943d91859df",
      "after": "ffd12cb3fb19c1ff904542c68985d657b415da8df201b0d707c3c411bcb4a7e4",
      "releasedAt": 1794579300000
    }
  }
},
  bacchae: {
  "revision": "text-2026-11-03.bacchae.1",
  "releasedAt": 1790863200000,
  "editions": {
    "original-en": {
      "before": "fd89db94d47b8a03eb008a7b94752c13145a9d2dcfb17e4e00adff5e474c8539",
      "after": "cea1d64ee2dcc2cb9c3dcc39b1e1f9f52c120a8c6f1ff33cfd22ecf623e5fdcc"
    },
    "modern-en": {
      "before": "9d205d8b021e5028bcd59cfc5d4b6754cd9bfdf3df13e41348780f064f3322c3",
      "after": "7531e554cbd2ece775f219fad7df9d66cdcf0d2111d54f979afccce5216320a8"
    },
    "modern-da": {
      "before": "a83da6b0cf8bf1fde94bef50c362b02b73b48d72ee967eb005199b07919d1003",
      "after": "bc9cf5e29e95848ca24e002f60760d9c2719d87d5409f7cfdef6be054c569209",
      "releasedAt": 1794579300000
    }
  }
},
  'magna-carta': {
    revision: 'text-2026-11-02.magna-da.1',
    releasedAt: Date.parse('2026-10-01T14:00:00Z'),
    editions: {
      'modern-da': {
  "before": "11e3b4de2820772b5258b1981f783b80dfb14db4667d9e8d6358004e6cc99009",
  "after": "5f148701e1bdc5c4bd9fe87289aeaf053567815f64c26595340af8320cd0b141",
  "releasedAt": 1793626744844
},
      'original-en': {
        before: 'ca7447fb99a427bd9e12b00dcb4a0f5c7452f6da410b4111eb35d47bfacc560f',
        after: 'fa73abf6f753a48a0c224c65bde46f8f2b8c56f25445224e78819e3c68abd6c4',
      },
      'modern-en': {
        before: 'cf7d388da295fff52af25f55d6dd692644b4ca96b521db4e9dc2525deaa5f586',
        after: 'cfa05de4109362a5889816ea4a06071944189da833907f3f916f9c323797cabb',
      },
    },
  },
  'pride-and-prejudice': {
    revision: 'structure-2026-09-24.1',
    releasedAt: Date.parse('2026-09-25T12:00:00Z'),
    editions: {
      'original-en': {
        before: '5a44024668550ab8cdae47579bd798b5b60c8e3e1401043b6d9f8777081760c6',
        after: '6d968f00645655554e44156a16a2713a3c1f60e74cb533d56aa5231847ca183c',
      },
      'modern-en': {
        before: 'd914bb2dc33dfb525d7c21b142cc1ae4ea85dcfdd84378c2a839c90d90c250e1',
        after: '6c80aa42dd44707774a6049d2a17bbfaf61806751e6f0cf5536b8837dabfc463',
      },
    },
  },
  'hamlet': {
    revision: 'text-2026-11-18.hamlet.1',
    releasedAt: Date.parse('2026-11-19T02:20:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: 'b355830766b696812decba35f95dee0ee68ff7662e36370194a129bc2147fda5',
        after: '10305a21b6bad2d8b722c0824a6a764dbc34710b59b9cc4fb7121a5f7d30cc9f',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: 'fea31e2b8d327f0fb7d7b11e4942ff6d73e048446304070b0edfa7962e7022d4',
        after: '580be9c5345c8a26bbc5ccb518972d542790b63048d7c4bf826b9b60d2fc45e9',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
      },
    },
  },
  'king-lear': {
    revision: 'text-2026-11-18.king-lear.1',
    releasedAt: Date.parse('2026-11-19T02:20:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: '9f4719b82396b06f919866a68fcfab53427865248f959dd6eff16e80b04b920c',
        after: '8ead3f96e37db56aa6be2b2813b4cec98059804e21d886859044cb20e62a87cf',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: 'b330f5edaddf72173f8958ee61ba3d027fdc5f6d0a5fb111e8bdc6bef56c9cf5',
        after: '7899e7b723876a88d8768fe5f6d841f7dd5a7ac1706b8b535eb43788968ccb4d',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
      },
    },
  },
  'othello': {
    revision: 'text-2026-11-18.othello.1',
    releasedAt: Date.parse('2026-11-19T02:20:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: '5beb0f0093ef10f1d725b797c3eef7cdfe370b3d74be8738f4fd01431dbdb04d',
        after: '6dd3299c1f2ee14328e85070b50c6c38b89ac26832aa424f7d58001ddb55ede1',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: '048b82fecf563ec728efa40b1a0bcb94cfc7cef907ef6c07c3e780a842d5b168',
        after: 'e3875ae1d4b92979120380221eef6846a77f06f2aeb1ec46610d3103cc381b10',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
      },
    },
  },
  'midsummer': {
    revision: 'text-2026-11-18.midsummer.1',
    releasedAt: Date.parse('2026-11-19T02:20:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: 'f9eca722e0488f7a4f44fd865e487d2ed0361fab9b783b11ff3ccd32b43a8666',
        after: '7fb7ccf8ad474d339bc7030763e9b7c71ba601107d7c927b9a288621039ef322',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: '5b516f16b544ccb0e30e21e1af9a29d98104acb40f7f3b6dc163ccc006d43e4d',
        after: '5c50feea901588dcab551a991f0f4f38d7c0b6d973990884b09a69cced035cff',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
      },
    },
  },
  'twelfth-night': {
    revision: 'text-2026-11-18.twelfth-night.1',
    releasedAt: Date.parse('2026-11-19T02:20:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: '95580e0b935cdfce4931acc61bd345c90b2ebbbae92bad677f09909ed2a5a5a0',
        after: '74206f65d14a126d0a2488d0d39f592052afd9562c2977079842156ca7bf70d4',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: '6082c3cbef7468f7144738817cc795c28d35fc112b53ef4635bbfe0f7379c9ff',
        after: '5b4c570d1be703306efc70ecf8016df8f773b20ee11c128c542900278fe87a60',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
      },
    },
  },
  'the-tempest': {
    revision: 'text-2026-11-18.the-tempest.1',
    releasedAt: Date.parse('2026-11-19T02:20:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: 'ddbade7e7141e485ae8a36fb6b34401a95c87de48054ff9d2053c5fb8d1e063f',
        after: '1b63b79a3567d466d694aa459f3c36724360b6dd6bf20c66abf7508605b44dcd',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: '82dcfbf3e42e6ebd5485e19ac7fdcc23e278794e7d7c709b38ac953955932417',
        after: '129e42daa8d5d7322b45afe8b9fd04e4a5c9a8ffb9cdba7539e3f4fc4e9177d2',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
      },
    },
  },
  'comedy-of-errors': {
    revision: 'text-2026-11-18.comedy-of-errors.1',
    releasedAt: Date.parse('2026-11-19T02:20:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: '6319d77729e29c7b62f5f8f651469fcbd2cffb337b4e3b67367c364ee2698353',
        after: '2ec8079e148b81879079f732bd403588f7716f8f1cf354cbc99823718aff8d59',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: '8c099fc4f43b2bd269d7c9161abcaab3e24adf75fb60a0a7bb9db116129beda2',
        after: 'deb21de13556e6fa5f9d0d59e3e10df2fa2571f2de5f5d0afe1b8c7a62c9d4a0',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
      },
    },
  },
  'coriolanus': {
    revision: 'text-2026-11-18.coriolanus.1',
    releasedAt: Date.parse('2026-11-19T02:20:00Z'),
    editions: {
      'modern-en': {
        // English repairs paired with the recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: 'cb7175962445184e3d28082130a5eee53b66dee497c1f92d9d516f512de8b488',
        after: '0055e48fe53acb2c0b5ed51aacda203cb26d072ea40950f2ce7fa5cb45689dc8',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
      },
      'modern-da': {
        // Recovered Danish, 18 Nov 2026 (danish-recovered-batch-02).
        before: '187cf22c3daab3d621d7b1906c4de9e2c76d3b6aa70e1957c4f7830b0f42f462',
        after: '9a8679c553ab62af506250cf8e8204fcf24d8c9d67bf43b7253a4fa7f5ff0896',
        releasedAt: Date.parse('2026-11-19T02:20:00Z'),
      },
    },
  },
}

/** The hash a new place or highlight in this edition is stamped with. */
export function currentContentRevision(bookId: string | undefined, editionKey: string | undefined): string | undefined {
  if (!bookId || !editionKey) return undefined
  return CONTENT_RELEASES[bookId]?.editions[editionKey]?.after
}

/** Was this record written against text an accepted release has since restructured? */
export function writtenBeforeRelease(
  bookId: string | undefined,
  editionKey: string | undefined,
  contentRevision: string | undefined,
  writtenAt: number | undefined,
): boolean {
  if (!bookId || !editionKey) return false
  const release = CONTENT_RELEASES[bookId]
  const edition = release?.editions[editionKey]
  if (!edition) return false
  if (contentRevision) return contentRevision === edition.before || Boolean(edition.previous?.some(item => item.before === contentRevision))
  // Every new Symposium write is stamped. An unstamped English record can
  // still arrive from an old offline client after publication; retain its repair.
  if (bookId === 'symposium') return true
  return typeof writtenAt === 'number' && Number.isFinite(writtenAt) && writtenAt < (edition.releasedAt ?? release.releasedAt)
}

/** Resolve unstamped historical records using their original write time.
 * Current stamped records always keep their explicit hash. */
export function sourceContentRevision(
  bookId: string, editionKey: string | undefined, revision: string | undefined, writtenAt: number | undefined,
): string | undefined {
  if (revision || !editionKey) return revision
  const release = CONTENT_RELEASES[bookId]
  const edition = release?.editions[editionKey]
  if (!edition?.previous?.length || typeof writtenAt !== 'number' || !Number.isFinite(writtenAt)) return revision
  if (writtenAt >= (edition.releasedAt ?? release.releasedAt)) return edition.after
  const previous = [...edition.previous].sort((a, b) => a.releasedAt - b.releasedAt)
  return previous.find(item => writtenAt < item.releasedAt)?.before ?? edition.before
}

export type MigrationKind = 'positions' | 'highlights'

const loaded: Record<MigrationKind, Map<string, CoordinateMigration>> = { positions: new Map(), highlights: new Map() }
/**
 * Symposium's map ships with the app (one map for places and highlights), so
 * its migration never depends on the network, even offline: the service
 * worker installs it with the reader shell (scripts/stamp-sw-app-shell.cjs).
 * It is its own bundle, loaded only for a reader holding Symposium data that
 * needs it (the reader waits for that before its first read, main.tsx); every
 * other reader's first page never downloads its 130 KB.
 */
let symposiumMap: Promise<CoordinateMigration> | null = null
function loadSymposiumMap(): Promise<CoordinateMigration | null> {
  symposiumMap ??= import('./symposiumCoordinateMap.json')
    .then(module => ((module as { default?: unknown }).default ?? module) as CoordinateMigration)
  return symposiumMap.then((map) => {
    for (const kind of ['positions', 'highlights'] as const) loaded[kind].set('symposium', map)
    return map
  }, () => {
    // Offline before the shell installed it: nothing is moved, nothing is lost; the next start asks again.
    symposiumMap = null
    return null
  })
}
const pending = new Map<string, Promise<CoordinateMigration | null>>()

/** Maps already in memory, for the synchronous read paths. */
export function loadedCoordinateMigration(kind: MigrationKind, bookId: string): CoordinateMigration | undefined {
  return loaded[kind].get(bookId)
}

function valid(data: unknown, bookId: string): data is CoordinateMigration {
  const release = CONTENT_RELEASES[bookId]
  const map = data as CoordinateMigration | null
  return !!map && map.bookId === bookId && map.revision === release.revision
    && Object.entries(release.editions).every(([key, edition]) => (
      map.editions?.[key]?.beforeSha256 === edition.before && map.editions[key].afterSha256 === edition.after
      && (edition.previous ?? []).every(item => map.editions[key].previous?.[item.before]?.beforeSha256 === item.before
        && map.editions[key].previous?.[item.before]?.afterSha256 === edition.after)
    ))
}

/** Fetch a published map once. A failure answers null and may be retried later. */
export function loadCoordinateMigration(kind: MigrationKind, bookId: string): Promise<CoordinateMigration | null> {
  const release = CONTENT_RELEASES[bookId]
  if (!release) return Promise.resolve(null)
  const ready = loaded[kind].get(bookId)
  if (ready) return Promise.resolve(ready)
  if (bookId === 'symposium') return loadSymposiumMap()
  const key = `${kind}:${bookId}`
  const inFlight = pending.get(key)
  if (inFlight) return inFlight
  const request = fetch(`/data/edition-migrations/${bookId}.${kind}.json?v=${release.revision}`)
    .then(response => (response.ok ? response.json() : null))
    .then((data: unknown) => {
      if (!valid(data, bookId)) return null
      loaded[kind].set(bookId, data)
      return data
    })
    .catch(() => null)
    .finally(() => { pending.delete(key) })
  pending.set(key, request)
  return request
}

/** Test seam. */
export function __setLoadedCoordinateMigration(kind: MigrationKind, migration: CoordinateMigration | null, bookId?: string): void {
  if (migration) loaded[kind].set(migration.bookId, migration)
  else if (bookId) loaded[kind].delete(bookId)
  else loaded[kind].clear()
}
