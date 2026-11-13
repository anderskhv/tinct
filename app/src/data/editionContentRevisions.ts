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
  'the-prince': {
  "revision": "text-2026-11-03.the-prince.1",
  "releasedAt": 1794574500000,
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
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '8ce0b1f6570584b4ba8168b25cb6ae365afcd0cc157cc4a0f15cd2d3efc62224',
        after: 'eec87f405113c665c38fd1edfc940a94c524c2c631a09c652e7fb21c0c05e511',
      },
    },
  },
  'beyond-good-and-evil': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '5b14eaa83a4b695afc10e74b203001ac33490f732a1fb42c141749687859d08a',
        after: 'e523d52b006da0963c0956cca1aa808145d62238db2686cf415a95ed7d849eb0',
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
    revision: 'text-2026-09-25.1',
    releasedAt: Date.parse('2026-09-25T12:00:00Z'),
    editions: {
      'modern-en': {
        before: '420b17153b6cb46f6a74e41bb633dcbc88099975720dac27c6bfb0bf6be51b4e',
        after: '949e4f77fd317601cc39dc701cfbc3f5f82a5b5a842c34e93c9a6328ef78add7',
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
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '909c7496f66b1314666a2053ca056d1f2defc2cdf50ad44719208b38c153fc62',
        after: '5cccffe12e998383856f3d80ba64eddfb5371bbfe0b01cf04d0df503fe6760eb',
      },
    },
  },
  // Text-only modern-en repairs (2026-10-21): paragraphs unchanged, wording new in the changed paragraphs.
  utilitarianism: {
    revision: 'text-2026-10-21.5',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-en': {
        before: '7457e909ce911b5043c692ccf51e7ce30266b5824aec22c10997931dfb737361',
        after: '534c43afa8af1f7dea12997361cd568a0569261d241e72c3fd6f961950a26fa1',
      },
    },
  },
  poetics: {
    revision: 'text-2026-10-21.5',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-en': {
        before: '20c7f0695e0360b9ea800ae11c0720bfe38d1e7e85b828d0a19bed542a9b175e',
        after: 'c14bf2d099284fad9b2801ba2272ef92ce9be3ba3e1eb43dfa789febd2f17323',
      },
    },
  },
  'genealogy-of-morals': {
    revision: 'text-2026-10-21.5',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-en': {
        before: '72ca79453b9a485fa0a8277df452809dba80b87ecaf6985121e020ef51d30a9c',
        after: 'f108ea298f97f055749347e71a5bfbe55398409c79b4162e7691735331677c6f',
      },
    },
  },
  'kant-groundwork': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '2ac2fce500388299d084ecf5b8e3be84c6f06bfc3747aa7262a4bacc7459d84d',
        after: '57c821d775792c3950f94a6d394e0d556310b21422e2c3bb2e6b63e77b249a9d',
      },
    },
  },
  // Text-only modern-en repairs (2026-10-21): paragraphs unchanged, wording new in the changed paragraphs.
  'war-and-peace': {
    revision: 'text-2026-10-21.6',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-en': {
        before: '93fb7594ee1e617095818f93da10ed3fbdc0d0e6abcf76280e0fb1ee3097e496',
        after: '65c253aa95e1e4cb21112e5d4aec5344364cd658a596264710d5b48d2bacfcd8',
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
  'notes-from-underground': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '8df3e74890b26ce3febb108540f3a7a32fd3afdc93b1d047cbe6b053793a0449',
        after: '401a1e58e4ff88897bf83a999172e8072dc774ca209e5131ce2d31a1a2332530',
      },
    },
  },
  'heart-of-darkness': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '169c288c26f0c8c07be6d181855123cd982023a0b780262576944f5833afa435',
        after: 'abcf3c20a7d0b42c15ad3196032cea5a14a113f8cecea35c70d5af8023d4aebf',
      },
    },
  },
  'jungle-book': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '821357c6bb7dc016b819f89fd9f857ffcc78b057f5718cf0e66068b3f249c640',
        after: '9eaf20289bbc99281feeae0310ffb4f434c6808c6943b986df07722dcd9debd0',
      },
    },
  },
  'hume-enquiry': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '8b9b306e32e35f9047f4f5247d07562b601024e014d9e93a373e6104204d3290',
        after: 'cd8a4daab2bed38c816b79ca74c7d464bbcce9bcc2ef8e1a9ee1f374f0977633',
      },
    },
  },
  'around-the-world-80-days': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '13b90c0526762af96d550fa512941dff043473c31c55efa877bb9465770745af',
        after: 'a2d94a65fb3f0a3872f105b6300e8c3ab4c61ca0ac84614822a17ff91c05f426',
      },
    },
  },
  'a-little-princess': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: '5e359e936c37e8e79ea7738597da244b7356369558e59ada48fc0f32fde8a020',
        after: 'c47540c17dd567bafe0934392b31a8d236e15e809244e419080e8abf3c4fa1b6',
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
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
      'modern-en': {
        before: 'd2d20614cb168f7dac5413213f98d41a9d21bd90ac3126fa592e52b58571f8ec',
        after: 'e6bfb94a075f25c959e1e97da77200aef84e40cec89dd9450f4a8f26c0a6ab01',
      },
    },
  },
  // Text-only modern-en repair (2026-10-21): chapters 1, 2, 5, 7, 8 and 9 re-rendered; paragraphs unchanged.
  'jekyll-and-hyde': {
    revision: 'text-2026-10-21.2',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-en': {
        before: '7bcc0ee81b68635f017b8324fab9dc2e4cc3fc0febb827e0431ce876a2d0ac6b',
        after: '640dc4ea5d7d56f4b015b000404b5275c5cf9223b9979ed6bfb3765155c4883d',
      },
    },
  },
  'on-liberty': {
    revision: 'text-2026-10-01.1',
    releasedAt: Date.parse('2026-10-01T09:00:00Z'),
    editions: {
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
    revision: 'text-2026-10-21.1',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-en': {
        before: '47fdf4f9a1b309f6747b48d00add73181cff9cd0a4c0063f81774a1a8a95bae6',
        after: '0f7f2f2fbfb6e17d1c070228df6ec190d05bac150eeb16b1d12dc99a24efe04b',
      },
    },
  },
  'the-republic': {
    revision: 'text-2026-10-21.1',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-en': {
        before: '02082bbef9bf9026cdcdb11c0bc60e0e518a832d63f19dcbcab65ca794078f57',
        after: '2bc78ba1f33b207c52ee98dd47954c82c07afb11b3b70d60f6a41af18b675277',
      },
    },
  },
  phaedrus: {
    revision: 'text-2026-10-21.1',
    releasedAt: Date.parse('2026-10-21T12:00:00Z'),
    editions: {
      'modern-en': {
        before: 'a246a86ca83ff33521735c1ff70681037ed4d956f87e71d0812ddf864979e06c',
        after: '5ad44b8b4dbd819c14936e91514f25d8f02a0c81f728ae7d666adaedf8e9575b',
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
      "releasedAt": 1794574500000,
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
      "releasedAt": 1794574500000
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
      "releasedAt": 1794574500000
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
