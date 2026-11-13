# Storage Evolution research coverage

Reviewed 2026-11-13. The curated catalog contains 64 dated hardware milestones and 120 model/generation labels across Dell/EMC, NetApp, Pure Storage and HPE/HP. This is a major-family research history, not a complete SKU inventory.

## Date and protocol rules

Each entry names its milestone: announcement, introduction, launch, shipping confirmation or hardware-release-history entry. Year-only and month-only evidence retain their precision. Vendor-scheduled availability is not asserted as confirmed shipment. A source publication or revision date is not automatically a launch date. Regional announcements are scoped explicitly. Sources are vendor-authored announcements, filings or documentation, including vendor releases carried by PR Newswire and GlobeNewswire. No third-party article text was copied.

NAS means file services; SAN means shared block access. NAS + SAN means a family supports both in an applicable configuration, not that every member supports every protocol. Historical FlashArray launches remain block-only entries; later native file services are not backdated. ASA and EF are block platforms; AFX and FlashBlade are file-oriented. PowerStore T/X deployment distinctions and direct-attached MSA SAS variants are called out.

Family-level milestones do not assign a shared launch day to every later SKU. Original vendor names remain visible; grouping by current lineage does not imply ownership at historical launch. Missing years/cells mean no verified entry in this catalog, not proof of no release. This static catalog is not an automated news or lifecycle feed.

## Included milestones

| Date | Vendor | Models / family | Date meaning | Primary evidence |
| --- | --- | --- | --- | --- |
| 1995-09 | netapp | F330 | Introduced | [Network Appliance](https://investors.netapp.com/static-files/0f78cc94-ad92-4bc7-b74c-606ade331abe) |
| 1996-01 | netapp | F220 | Introduced | [Network Appliance](https://investors.netapp.com/static-files/0f78cc94-ad92-4bc7-b74c-606ade331abe) |
| 1996-05 | netapp | F540 | Announced | [Network Appliance](https://investors.netapp.com/static-files/0f78cc94-ad92-4bc7-b74c-606ade331abe) |
| 2009-04-14 | dell | Symmetrix V-Max | Announced | [EMC (Dell archive)](https://www.dell.com/en-us/dt/corporate/newsroom/announcements/2009/04/20090414-01.htm) |
| 2010 | netapp | FAS3200 series | Introduced | [NetApp Tech OnTap](https://community.netapp.com/fukiw75442/attachments/fukiw75442/tech-on-tap-articles/80/1/1301tot_article_feature_pdf_v2.pdf) |
| 2011-01-18 | dell | VNX series, VNXe series | Announced | [EMC via PR Newswire](https://www.prnewswire.com/news-releases/emc-unveils-new-vnx-unified-storage-family-delivering-record-breaking-simplicity-efficiency-and-affordability-114049519.html), [EMC via PR Newswire](https://www.prnewswire.com/news-releases/new-emc-vnxe-and-vnx-unified-storage-now-shipping-worldwide-117576888.html) |
| 2011-07-13 | dell | VMAXe | Announced | [EMC (Dell archive)](https://www.dell.com/en-us/dt/corporate/newsroom/announcements/2011/07/20110713-01.htm) |
| 2012-05 | pure | FlashArray — first commercial generation | Launched | [Pure Storage filing with SEC](https://www.sec.gov/Archives/edgar/data/1474432/000119312515326779/d895532ds1a.htm) |
| 2013-09-04 | dell | VNX5200, VNX5400, VNX5600, VNX5800, VNX7600, VNX8000 | Announced | [EMC via PR Newswire](https://www.prnewswire.com/news-releases/new-emc-vnx-shatters-the-definition-and-economics-of-midrange-storage-222314001.html) |
| 2013-11-14 | dell | XtremIO X-Brick platform | GA confirmed | [EMC (Dell archive)](https://www.dell.com/en-us/dt/corporate/newsroom/announcements/2013/11/20131114-02.htm) |
| 2014-02 | netapp | FAS8020, FAS8040, FAS8060 | Released | [NetApp](https://investors.netapp.com/static-files/ea62f992-44f6-476e-807c-84c49fe1be85), [NetApp Tech OnTap](https://community.netapp.com/fukiw75442/attachments/fukiw75442/tech-on-tap-articles/294/1/1406tot_article_feature_pdf.pdf) |
| 2014-07-08 | dell | S210, X410 | Announced | [EMC (Dell archive)](https://www.dell.com/en-us/dt/corporate/newsroom/announcements/2014/07/20140708-03.htm) |
| 2015 | hpe | StoreServ 20000 series | Introduction year | [HPE Support](https://support.hpe.com/hpesc/public/docDisplay?docId=c05050717&docLocale=en_US) |
| 2015-06-01 | pure | //m20, //m50, //m70 | Announced | [Pure Storage via PR Newswire](https://www.prnewswire.com/news-releases/pure-storage-unveils-flasharraym-pure1-and-evergreen-storage-introducing-a-simpler-and-more-efficient-model-for-storage-ownership-300091529.html) |
| 2015-08 | hpe | 8200, 8400, 8440, 8450 | Introduced | [HPE Support](https://support.hpe.com/hpesc/public/docDisplay?docId=a00008513en_us&docLocale=en_US), [HP via PR Newswire](https://www.prnewswire.com/in/news-releases/hp-extends-flash-storage-portfolio-with-industrys-most-affordable-and-automated-all-flash-array-528614041.html) |
| 2016-03-14 | pure | FlashBlade — original platform | Announced | [Pure Storage via PR Newswire](https://www.prnewswire.com/news-releases/pure-storage-introduces-flashblade-the-cloud-scale-all-flash-data-platform-300235263.html), [Pure Storage](https://www.purestorage.com/content/dam/purestorage/pdf/QuarterReport/Q4-2017.pdf) |
| 2016-05-02 | dell | Unity 300 / 300F, Unity 400 / 400F, Unity 500 / 500F, Unity 600 / 600F | Announced | [EMC via PR Newswire](https://www.prnewswire.com/news-releases/emc-unity-breaks-new-ground-for-all-flash-storage-simplicity-and-affordability-300260667.html), [Dell documentation](https://www.dell.com/support/manuals/en-us/unityvsa-%28virtual-storage-appliance%29/unity_p_unity_platforms_hardware_information_specs/description?guid=guid-f09d5212-91e7-46dc-bfe8-79e65ff61836) |
| 2017-01-31 | netapp | AFF A700s | Announced | [NetApp via GlobeNewswire](https://www.globenewswire.com/news-release/2017/01/31/912400/0/en/New-NetApp-All-Flash-Innovations-Improve-Data-Center-Economics.html) |
| 2017-04-11 | pure | FlashArray//X | Announced | [Pure Storage via PR Newswire](https://www.prnewswire.com/news-releases/pure-storage-announces-first-enterprise-class-all-nvme-flash-array-flasharrayx-300437799.html) |
| 2018 | dell | PowerMax 2000, PowerMax 8000 | Introduced | [Dell InfoHub](https://www.dell.com/en-us/infohub/articles/a-detailed-overview-of-the-next-generation-powermax-platform-1) |
| 2018-05 | netapp | AFF A800 | Shipping confirmed | [NetApp](https://www.netapp.com/pt/blog/nvme-over-fabric/) |
| 2018-05-22 | hpe | AF20, AF40, AF60, AF80, HF20, HF40, HF60 | Announced | [HPE Japan blog](https://community.hpe.com/t5/hpe-blog-japan/nimble%E6%96%B0%E3%83%A2%E3%83%87%E3%83%AB%E3%82%92%E3%83%AA%E3%83%AA%E3%83%BC%E3%82%B9%E3%81%97%E3%81%BE%E3%81%97%E3%81%9F/ba-p/7006628) |
| 2018-05-23 | pure | //X10, //X20, //X50, //X70, //X90 | Announced | [Pure Storage via PR Newswire](https://www.prnewswire.com/news-releases/introducing-the-new-flasharrayx-shared-accelerated-storage-for-every-workload-300653377.html) |
| 2019-04-30 | dell | H5600 | Announced | [Dell Technologies](https://investors.delltechnologies.com/news-events/press-releases/detail/406/dell-technologies-powers-real-transformation-and-innovation-with-new-storage-data-management-and-data-protection-solutions) |
| 2019-04-30 | dell | Unity XT series | Announced | [Dell Technologies](https://investors.delltechnologies.com/news-events/press-releases/detail/406/dell-technologies-powers-real-transformation-and-innovation-with-new-storage-data-management-and-data-protection-solutions) |
| 2019-06-18 | hpe | Primera 630, Primera 650, Primera 670 | Announced | [HPE](https://www.hpe.com/us/en/newsroom/press-kit/2019/06/discover-2019-las-vegas.html), [HPE Support](https://portal-iam-ext-pro.it.hpe.com/hpesc/public/docDisplay?docId=a00088928en_us&docLocale=en_US) |
| 2019-08-20 | netapp | EF600 | Announced | [NetApp](https://www.netapp.com/ja/newsroom/press-releases/news-rel-20190820-456600/) |
| 2019-09-17 | pure | FlashArray//C | Announced | [Pure Storage (Everpure archive)](https://www.everpuredata.com/au/company/newsroom/press-releases/expanded-pure-portfolio.html/) |
| 2019-10-29 | netapp | AFF A400 | Announced | [NetApp](https://www.netapp.com/blog/reinvent-your-modern-it-with-the-newest-aff-nvme-all-flash-storage/) |
| 2020-05-05 | dell | 1000T / 1000X, 3000T / 3000X, 5000T / 5000X, 7000T / 7000X, 9000T / 9000X | Announced | [Dell Technologies](https://investors.delltechnologies.com/node/10826), [Dell InfoHub](https://www.dell.com/en-us/infohub/articles/dell-powerstore-introduction-to-gen-1-gen-2-platforms) |
| 2020-06-16 | dell | F200, F600 | Announced | [Dell Technologies](https://www.dell.com/en-us/dt/corporate/newsroom/announcements/detailpage.press-releases~usa~2020~06~20200616-dell-technologies-powerscale-storage.htm) |
| 2020-08-25 | pure | FlashArray//C — second generation | Announced | [Pure Storage (Everpure archive)](https://www.everpuredata.com/au/company/newsroom/press-releases/second-generation-flasharray-c.html) |
| 2020-09-08 | hpe | MSA 1060, MSA 2060, MSA 2062 | Announced | [HPE](https://www.hpe.com/us/en/newsroom/press-release/2020/09/hewlett-packard-enterprise-announces-simple-and-affordable-next-generation-storage-solution-for-small-businesses.html), [HPE Support](https://downloads.hpe.com/pub/softlib2/software1/pubsw-linux/p1817302058/v188821/R0Q73-90011.html) |
| 2020-10-20 | netapp | AFF A250 | Announced | [NetApp](https://www.netapp.com/blog/new-nvme-entry-system-aff-a250/), [NetApp](https://www.netapp.com/media/20046-Book_of_INSIGHT_2020.pdf) |
| 2021-04-20 | dell | 500T | Announced | [Dell Technologies](https://www.dell.com/en-us/dt/corporate/newsroom/announcements/detailpage.press-releases~usa~2021~04~20210420-dell-technologies-turns-up-the-power-on-dellemc-powerstore-with-greater-performance-and-automation.htm) |
| 2021-05-04 | hpe | Alletra 6000 series, Alletra 9000 series | Announced | [HPE](https://www.hpe.com/us/en/newsroom/blog-post/2021/05/hpe-is-reinventing-storage.html) |
| 2021-12-08 | pure | FlashArray//XL | Announced | [Pure Storage (Everpure archive)](https://investor.everpuredata.com/news-and-events/press-releases/press-release-details/2021/Pure-Storage-Introduces-New-Top-End-FlashArray-Model-Bringing-Power-and-Scale-With-Unparalleled-Simplicity-to-the-Enterprise/default.aspx) |
| 2021-12-14 | netapp | AFF A900 | Announced | [NetApp](https://www.netapp.com/newsroom/press-releases/news-rel-20211214-493286/) |
| 2022 | dell | PowerMax 2500, PowerMax 8500 | Introduced | [Dell InfoHub](https://www.dell.com/en-us/infohub/articles/a-detailed-overview-of-the-next-generation-powermax-platform-1) |
| 2022-06-08 | pure | FlashBlade//S | Announced | [Pure Storage via PR Newswire](https://www.prnewswire.com/news-releases/pure-storage-introduces-flashblades-a-revolutionary-platform-that-addresses-the-demands-of-unstructured-data-and-modern-application-growth-301563676.html) |
| 2023-02-07 | netapp | AFF A150 | Announced | [NetApp](https://www.netapp.com/newsroom/press-releases/news-rel-20230207-701929/) |
| 2023-02-07 | netapp | AFF C250, AFF C400, AFF C800 | Announced | [NetApp](https://www.netapp.com/newsroom/press-releases/news-rel-20230207-701929/) |
| 2023-03-01 | pure | FlashBlade//E | Announced | [Pure Storage via PR Newswire](https://www.prnewswire.com/news-releases/pure-storage-ushers-in-the-new-era-of-unstructured-data-storage-with-flashbladee-301759057.html) |
| 2023-04-04 | hpe | GreenLake for Block Storage on Alletra MP | Announced | [HPE](https://www.hpe.com/us/en/newsroom/press-release/2023/04/hpe-transforms-data-lifecycle-management-with-expanded-hpe-alletra-portfolio-with-new-file-block-and-data-protection-services.html) |
| 2023-04-04 | hpe | GreenLake for File Storage MP | Announced | [HPE](https://www.hpe.com/us/en/newsroom/press-release/2023/04/hpe-transforms-data-lifecycle-management-with-expanded-hpe-alletra-portfolio-with-new-file-block-and-data-protection-services.html) |
| 2023-06-14 | pure | FlashArray//E | Announced | [Pure Storage via PR Newswire](https://www.prnewswire.com/news-releases/pure-storage-expands-puree-family-enabling-customers-to-choose-flash-for-any-workload-301850414.html), [Pure Storage](https://www.everpuredata.com/content/dam/pdf/en/legal/2024-form-10-k.pdf) |
| 2023-06-14 | pure | FlashArray//X R4, FlashArray//C R4 | Announced | [Pure Storage (Everpure archive)](https://www.everpuredata.com/company/newsroom/press-releases/pure-delivers-advancements-with-next-gen-flasharray-x-and-c.html), [Pure Storage via PR Newswire](https://www.prnewswire.com/news-releases/pure-storage-delivers-the-first-and-only-native-unified-block-and-file-experience-purpose-built-for-flash-storage-301807720.html) |
| 2024-02-20 | dell | F210, F710 | Announced | [Dell Technologies](https://www.dell.com/en-us/blog/next-gen-workloads-require-next-gen-storage/) |
| 2024-05-14 | netapp | AFF A70, AFF A90, AFF A1K | Announced | [NetApp](https://www.netapp.com/newsroom/press-releases/news-rel-20240514-593419/) |
| 2024-09-24 | netapp | ASA A70, ASA A90, ASA A1K | Announced | [NetApp](https://www.netapp.com/product-updates/new-asa-a-series/), [NetApp](https://www.netapp.com/blog/ups-innovation-ante/) |
| 2024-09-24 | netapp | FAS70, FAS90 | Announced | [NetApp](https://www.netapp.com/blog/ups-innovation-ante/) |
| 2024-11-11 | netapp | AFF A20, AFF A30, AFF A50 | Announced | [NetApp](https://www.netapp.com/blog/aff-a-series-c-series-boost-performance/), [NetApp documentation](https://docs.netapp.com/us-en/ontap-systems/whats-new.html) |
| 2024-11-11 | netapp | AFF C30, AFF C60, AFF C80 | Announced | [NetApp](https://www.netapp.com/blog/aff-a-series-c-series-boost-performance/), [NetApp documentation](https://docs.netapp.com/us-en/ontap-systems/whats-new.html) |
| 2024-11-26 | pure | FlashArray//C20 | Announced | [Pure Storage (Everpure archive)](https://www.everpuredata.com/tw/company/newsroom/press-releases/pure-expands-flasharray-product-lineup-launches-flashArray-c20-tw.html) |
| 2025-02-11 | netapp | ASA A20, ASA A30, ASA A50 | Announced | [NetApp](https://www.netapp.com/fr/product-updates/asa-a-series-entry-midrange-block-storage/) |
| 2025-03-11 | pure | FlashBlade//EXA | Announced | [Pure Storage via PR Newswire](https://www.prnewswire.com/news-releases/pure-storage-introduces-flashbladeexa-the-worlds-most-powerful-data-storage-platform-for-ai-and-high-performance-computing-302397687.html) |
| 2025-04 | netapp | FAS50 | Hardware release | [NetApp documentation](https://docs.netapp.com/us-en/ontap-systems/whats-new.html) |
| 2025-05 | netapp | ASA C30 | Hardware release | [NetApp documentation](https://docs.netapp.com/us-en/ontap-systems/whats-new.html) |
| 2025-06-18 | pure | FlashBlade//S R2 | Announced | [Pure Storage via PR Newswire](https://www.prnewswire.com/news-releases/pure-storage-unveils-next-generation-storage-products-to-deliver-performance-at-any-scale-302484778.html) |
| 2025-06-18 | pure | FlashArray//ST | Announced | [Pure Storage via PR Newswire](https://www.prnewswire.com/news-releases/pure-storage-unveils-next-generation-storage-products-to-deliver-performance-at-any-scale-302484778.html) |
| 2025-06-18 | pure | FlashArray//XL R5 | Announced | [Pure Storage via PR Newswire](https://www.prnewswire.com/news-releases/pure-storage-unveils-next-generation-storage-products-to-deliver-performance-at-any-scale-302484778.html) |
| 2025-10 | netapp | AFX 1K | Hardware release | [NetApp documentation](https://docs.netapp.com/us-en/ontap-systems/whats-new.html) |
| 2026-05-19 | dell | PowerStore 1500, PowerStore 5500, PowerStore 9500 | Announced | [Dell Technologies](https://www.dell.com/en-us/newsroom/announcements/dell-technologies-rewrites-the-rules-of-storage-modernization-and-performance-with-dell-powerstore-elite), [Dell Technologies](https://www.dell.com/en-us/dt/corporate/newsroom/announcements/detailpage.press-releases~usa~2026~05~dell-technologies-reimagines-the-modern-data-center-for-the-ai-era.htm) |
| 2026-07 | netapp | AFX 2K | Hardware release | [NetApp documentation](https://docs.netapp.com/us-en/ontap-systems/whats-new.html) |

## Deliberate research gaps

Earlier CLARiiON/Celerra, EqualLogic/Compellent and VMAX generations; older FAS, AFF and E-Series models; HP EVA/XP/StoreEasy, 3PAR 7000 and Alletra 5000 launch dates remain follow-up areas. Indexed 2012 HP fact sheets returned unavailable responses during review, so their guessed dates were not added. MSA Gen7 2070/2072 has QuickSpecs revisions from December 2024 and March 2025; those alone do not establish first shipping. Object-only platforms, backup appliances, tape and software-only updates are outside the NAS/SAN hardware launch list.

## Website behavior

The left sidebar links to #evolution. The timeline groups milestones by year; the comparison includes every year in the selected range and explicit gap cells. The model index and research references use the same filters. Vendor, protocol, model text, year range, sort and view are encoded in the hash for reload/bookmark sharing. CSV exports only the filtered events with full source URLs, date meanings, availability evidence, scope and review date. No account or equipment connection is needed.

## Validation

Logic tests cover provenance/schema integrity, combined filters, historical protocol distinctions, gap years, date precision, bookmark sanitization and CSV evidence. The Chromium suite checks all four views, deep links, data filters, real CSV download, invalid ranges, escaping, global search and 16 responsive view combinations (320/390/768/1440px), plus light/dark captures. Test results do not certify vendor equipment or establish current model support.
