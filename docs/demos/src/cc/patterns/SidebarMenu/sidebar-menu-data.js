/* Control Centre sidebar menu — REAL data.
 * ---------------------------------------------------------------
 * Every visible Control Centre screen on affino.com, as the Hub's control
 * profiles hold it (control_profiles_search, cache of 2026-09-21: 440 visible
 * profiles). Generated 2026-09-23; regenerate rather than hand-edit.
 *
 * STRUCTURE, matching https://www.affino.com/control/ (designer, 2026-09-23):
 *   - modules: the top-level hubs, in their SortOrder — 11 of the 12: System
 *     Management (Affino-internal) is left out of the demo (designer,
 *     2026-09-23), so 404 screens
 *   - sections: each module's own CenterPageGroupName list, in that order
 *     ("Manage", "Import Export", "Settings", ...) — the groups its landing
 *     page is split into
 *   - items: each screen's CenterPageGroupName picks its section; SortOrder
 *     orders it within the section (name breaks ties). Screens with
 *     ShowOnCenterPage false are left out, as the live page leaves them out
 *     (one: Design Script Sections).
 *   The menu renders sections in order without headings — the SidebarMenu
 *   design has no heading row — so the grouping is carried by the ORDER.
 *
 * analysis: the Analysis rail panel, DERIVED from the same data — each
 * module's analysis sections ("Analysis", "Sales Analysis", "Subscription
 * Analysis"), not a keyword match on screen names.
 *
 * Icons: Lucide names per module. Security (shield) is a new pick — not from
 * Figma.
 *
 * TODO(backend:ControlScreen) sidebar-nav-data: static snapshot. The real
 * menu should come from the operator's permitted control profiles —
 * GET /control/menu -> this shape — so a user only sees the screens their
 * security rights allow. `link` is each screen's real /control/ route.
 */
var CC_SIDEBAR_MENU = {
  "modules": [
    {
      "name": "CRM",
      "code": 830,
      "link": "/control/crm",
      "icon": "user-cog",
      "sections": [
        {
          "name": "CRM",
          "items": [
            {
              "name": "Contacts",
              "code": 868,
              "link": "/control/contacts"
            },
            {
              "name": "Contact Lists",
              "code": 1674,
              "link": "/control/contact-lists"
            },
            {
              "name": "Accounts",
              "code": 867,
              "link": "/control/accounts"
            },
            {
              "name": "Account Lists",
              "code": 2143,
              "link": "/control/account-lists"
            },
            {
              "name": "Contact Notes",
              "code": 1664,
              "link": "/control/contact-notes"
            },
            {
              "name": "Tasks",
              "code": 1690,
              "link": "/control/tasks"
            },
            {
              "name": "Opportunities",
              "code": 1580,
              "link": "/control/opportunities"
            },
            {
              "name": "Contracts",
              "code": 1094,
              "link": "/control/contracts"
            },
            {
              "name": "Projects",
              "code": 1798,
              "link": "/control/projects"
            },
            {
              "name": "Bills",
              "code": 1740,
              "link": "/control/bills"
            }
          ]
        },
        {
          "name": "Analysis",
          "items": [
            {
              "name": "Audience Dashboard",
              "code": 1986,
              "link": "/control/audience-dashboard"
            },
            {
              "name": "Live Users",
              "code": 511,
              "link": "/control/live-users"
            },
            {
              "name": "CRM Analysis",
              "code": 1703,
              "link": "/control/crm-analysis"
            },
            {
              "name": "Accounts Report",
              "code": 1976,
              "link": "/control/accounts-report"
            },
            {
              "name": "Opportunity Analysis",
              "code": 1582,
              "link": "/control/opportunity-analysis"
            },
            {
              "name": "Project Analysis",
              "code": 1725,
              "link": "/control/project-analysis"
            },
            {
              "name": "Contract Analysis",
              "code": 1702,
              "link": "/control/contract-analysis"
            },
            {
              "name": "Bill Analysis",
              "code": 1743,
              "link": "/control/bill-analysis"
            },
            {
              "name": "User Analysis",
              "code": 688,
              "link": "/control/user-analysis"
            },
            {
              "name": "Networking Analysis",
              "code": 1720,
              "link": "/control/networking-analysis"
            },
            {
              "name": "Social Wall",
              "code": 1595,
              "link": "/control/social-wall"
            },
            {
              "name": "Email Send Logs",
              "code": 2033,
              "link": "/control/email-send-logs"
            },
            {
              "name": "Email Notifications",
              "code": 1998,
              "link": "/control/email-notifications"
            },
            {
              "name": "Awards Analysis",
              "code": 1899,
              "link": "/control/awards-analysis"
            },
            {
              "name": "Directory Messaging Report",
              "code": 2034,
              "link": "/control/directory-messaging-report"
            },
            {
              "name": "On Page Feedback Analysis",
              "code": 1839,
              "link": "/control/on-page-feedback-analysis"
            },
            {
              "name": "Job Application Analysis",
              "code": 1898,
              "link": "/control/job-application-analysis"
            }
          ]
        },
        {
          "name": "Communication",
          "items": [
            {
              "name": "Comments Approval",
              "code": 853,
              "link": "/control/comments-approval"
            },
            {
              "name": "Dynamic Form Entries",
              "code": 488,
              "link": "/control/dynamic-form-entries"
            },
            {
              "name": "Forum Threads",
              "code": 1867,
              "link": "/control/forum-threads"
            },
            {
              "name": "Forum Subscribers",
              "code": 618,
              "link": "/control/forum-subscribers"
            },
            {
              "name": "User Password Update",
              "code": 1755,
              "link": "/control/user-password-update"
            }
          ]
        },
        {
          "name": "Events",
          "items": [
            {
              "name": "Attendee Check-in",
              "code": 2175,
              "link": "/control/attendee-check-in"
            },
            {
              "name": "Awards Criteria",
              "code": 2187,
              "link": "/control/awards-criteria"
            },
            {
              "name": "Attendees",
              "code": 1852,
              "link": "/control/attendees"
            },
            {
              "name": "Awards",
              "code": 1858,
              "link": "/control/awards"
            },
            {
              "name": "Awards Management",
              "code": 1872,
              "link": "/control/awards-management"
            },
            {
              "name": "Sponsors",
              "code": 1881,
              "link": "/control/sponsors"
            }
          ]
        },
        {
          "name": "Manage",
          "items": [
            {
              "name": "Bulk Account Update",
              "code": 2167,
              "link": "/control/bulk-account-update"
            },
            {
              "name": "Business Units",
              "code": 1783,
              "link": "/control/business-units"
            },
            {
              "name": "Sales Teams",
              "code": 1774,
              "link": "/control/sales-teams"
            },
            {
              "name": "Dynamic Forms",
              "code": 490,
              "link": "/control/dynamic-forms"
            },
            {
              "name": "Online Forms",
              "code": 402,
              "link": "/control/online-forms"
            },
            {
              "name": "Forums",
              "code": 486,
              "link": "/control/forums"
            }
          ]
        },
        {
          "name": "Import Export",
          "items": [
            {
              "name": "Account List Import",
              "code": 2147,
              "link": "/control/account-list-import"
            },
            {
              "name": "Account Subscription Import",
              "code": 1856,
              "link": "/control/account-subscription-import"
            },
            {
              "name": "Attendee Import",
              "code": 2107,
              "link": "/control/attendee-import"
            },
            {
              "name": "Attendee Batch Delete",
              "code": 2108,
              "link": "/control/attendee-batch-delete"
            },
            {
              "name": "Awards Media Export",
              "code": 1918,
              "link": "/control/awards-media-export"
            },
            {
              "name": "Contact List Import",
              "code": 1871,
              "link": "/control/contact-list-import"
            }
          ]
        },
        {
          "name": "Settings",
          "items": [
            {
              "name": "Contact List Groups",
              "code": 2007,
              "link": "/control/contact-list-groups"
            },
            {
              "name": "Comment And Rating Profiles",
              "code": 633,
              "link": "/control/comment-and-rating-profiles"
            },
            {
              "name": "Cookie Policies",
              "code": 1093,
              "link": "/control/cookie-policies"
            },
            {
              "name": "Forum Profiles",
              "code": 498,
              "link": "/control/forum-profiles"
            },
            {
              "name": "Emoticons",
              "code": 1057,
              "link": "/control/emoticons"
            },
            {
              "name": "Emoticon Profiles",
              "code": 1058,
              "link": "/control/emoticon-profiles"
            },
            {
              "name": "ECard Profiles",
              "code": 730,
              "link": "/control/ecard-profiles"
            },
            {
              "name": "Mailing List Profiles",
              "code": 967,
              "link": "/control/mailing-list-profiles"
            },
            {
              "name": "Event Profiles",
              "code": 1018,
              "link": "/control/event-profiles"
            },
            {
              "name": "Seminar Profiles",
              "code": 974,
              "link": "/control/seminar-profiles"
            },
            {
              "name": "Public Profiles",
              "code": 937,
              "link": "/control/public-profiles"
            },
            {
              "name": "My Account Profiles",
              "code": 903,
              "link": "/control/my-account-profiles"
            },
            {
              "name": "My Information Profiles",
              "code": 936,
              "link": "/control/my-information-profiles"
            },
            {
              "name": "My Interests Profiles",
              "code": 2013,
              "link": "/control/my-interests-profiles"
            },
            {
              "name": "My Library Profiles",
              "code": 2016,
              "link": "/control/my-library-profiles"
            },
            {
              "name": "My Messages Profiles",
              "code": 852,
              "link": "/control/my-messages-profiles"
            },
            {
              "name": "My Preferences Profiles",
              "code": 1903,
              "link": "/control/my-preferences-profiles"
            },
            {
              "name": "Metering Profiles",
              "code": 1714,
              "link": "/control/metering-profiles"
            },
            {
              "name": "Terms And Conditions Profiles",
              "code": 765,
              "link": "/control/terms-and-conditions-profiles"
            },
            {
              "name": "Team Time Profiles",
              "code": 2024,
              "link": "/control/team-time-profiles"
            },
            {
              "name": "Recruitment Profiles",
              "code": 1055,
              "link": "/control/recruitment-profiles"
            },
            {
              "name": "Recruitment Sector Profiles",
              "code": 1047,
              "link": "/control/recruitment-sector-profiles"
            },
            {
              "name": "Salaries",
              "code": 1566,
              "link": "/control/salaries"
            },
            {
              "name": "Salary Ranges",
              "code": 1567,
              "link": "/control/salary-ranges"
            }
          ]
        }
      ]
    },
    {
      "name": "Content",
      "code": 268,
      "link": "/control/content",
      "icon": "file-text",
      "sections": [
        {
          "name": "Analysis",
          "items": [
            {
              "name": "Analysis Dashboard",
              "code": 2056,
              "link": "/control/analysis-dashboard"
            },
            {
              "name": "Live Dashboard",
              "code": 829,
              "link": "/control/live-dashboard"
            },
            {
              "name": "Site Analysis",
              "code": 912,
              "link": "/control/site-analysis"
            },
            {
              "name": "Articles Report",
              "code": 1984,
              "link": "/control/articles-report"
            },
            {
              "name": "Content Analysis",
              "code": 687,
              "link": "/control/content-analysis"
            },
            {
              "name": "Broken Links",
              "code": 968,
              "link": "/control/broken-links"
            },
            {
              "name": "Unused Content",
              "code": 820,
              "link": "/control/unused-content"
            },
            {
              "name": "Top Visits",
              "code": 1843,
              "link": "/control/top-visits"
            },
            {
              "name": "Content Subscription Analysis",
              "code": 949,
              "link": "/control/content-subscription-analysis"
            }
          ]
        },
        {
          "name": "Manage",
          "items": [
            {
              "name": "Inbox",
              "code": 923,
              "link": "/control/inbox"
            },
            {
              "name": "Articles",
              "code": 1097,
              "link": "/control/articles"
            },
            {
              "name": "Article Steps",
              "code": 769,
              "link": "/control/article-steps"
            },
            {
              "name": "Large Article Images",
              "code": 2120,
              "link": "/control/large-article-images"
            },
            {
              "name": "Article Archive",
              "code": 921,
              "link": "/control/article-archive"
            },
            {
              "name": "Editions",
              "code": 1789,
              "link": "/control/editions"
            },
            {
              "name": "Topic Lists",
              "code": 848,
              "link": "/control/topic-lists"
            },
            {
              "name": "Assign Content Subscriptions",
              "code": 944,
              "link": "/control/assign-content-subscriptions"
            },
            {
              "name": "Content Subscriptions",
              "code": 2138,
              "link": "/control/content-subscriptions"
            }
          ]
        },
        {
          "name": "Import Export",
          "items": [
            {
              "name": "Article Import",
              "code": 611,
              "link": "/control/article-import"
            },
            {
              "name": "Article Export",
              "code": 610,
              "link": "/control/article-export"
            },
            {
              "name": "Article Batch Delete",
              "code": 2050,
              "link": "/control/article-batch-delete"
            },
            {
              "name": "Article Step Import",
              "code": 1729,
              "link": "/control/article-step-import"
            },
            {
              "name": "Article Step Export",
              "code": 1730,
              "link": "/control/article-step-export"
            },
            {
              "name": "Edition Import",
              "code": 2011,
              "link": "/control/edition-import"
            },
            {
              "name": "Edition Batch Delete",
              "code": 2111,
              "link": "/control/edition-batch-delete"
            },
            {
              "name": "Topic Import",
              "code": 1059,
              "link": "/control/topic-import"
            },
            {
              "name": "Topic Export",
              "code": 1621,
              "link": "/control/topic-export"
            },
            {
              "name": "SEO Import",
              "code": 1622,
              "link": "/control/seo-import"
            }
          ]
        },
        {
          "name": "Settings",
          "items": [
            {
              "name": "Analysis Dashboard Settings",
              "code": 2057,
              "link": "/control/analysis-dashboard-settings"
            },
            {
              "name": "Channel Groups",
              "code": 1732,
              "link": "/control/channel-groups"
            },
            {
              "name": "Article Attributes",
              "code": 943,
              "link": "/control/article-attributes"
            },
            {
              "name": "Article Profiles",
              "code": 922,
              "link": "/control/article-profiles"
            },
            {
              "name": "Article Icons",
              "code": 919,
              "link": "/control/article-icons"
            },
            {
              "name": "Edition Profiles",
              "code": 1786,
              "link": "/control/edition-profiles"
            },
            {
              "name": "Incoming Feeds",
              "code": 946,
              "link": "/control/incoming-feeds"
            },
            {
              "name": "Outgoing Feeds",
              "code": 910,
              "link": "/control/outgoing-feeds"
            },
            {
              "name": "Article Archive Profiles",
              "code": 917,
              "link": "/control/article-archive-profiles"
            },
            {
              "name": "Article Types",
              "code": 770,
              "link": "/control/article-types"
            },
            {
              "name": "Clipboard Profiles",
              "code": 2099,
              "link": "/control/clipboard-profiles"
            },
            {
              "name": "Content Types",
              "code": 1815,
              "link": "/control/content-types"
            },
            {
              "name": "Directory Article Profiles",
              "code": 2063,
              "link": "/control/directory-article-profiles"
            },
            {
              "name": "Directory Profiles",
              "code": 971,
              "link": "/control/directory-profiles"
            },
            {
              "name": "Directory Step Profiles",
              "code": 1888,
              "link": "/control/directory-step-profiles"
            },
            {
              "name": "Related Profiles",
              "code": 782,
              "link": "/control/related-profiles"
            },
            {
              "name": "Topic Profiles",
              "code": 1994,
              "link": "/control/topic-profiles"
            },
            {
              "name": "Workflow Profiles",
              "code": 916,
              "link": "/control/workflow-profiles"
            },
            {
              "name": "Comparison Profiles",
              "code": 2020,
              "link": "/control/comparison-profiles"
            },
            {
              "name": "Content Subscription Profiles",
              "code": 942,
              "link": "/control/content-subscription-profiles"
            }
          ]
        }
      ]
    },
    {
      "name": "Marketing",
      "code": 740,
      "link": "/control/marketing",
      "icon": "megaphone",
      "sections": [
        {
          "name": "Analysis",
          "items": [
            {
              "name": "Ad Campaign Analysis",
              "code": 689,
              "link": "/control/ad-campaign-analysis"
            },
            {
              "name": "Campaign Dashboards",
              "code": 2078,
              "link": "/control/campaign-dashboards"
            },
            {
              "name": "Lifecycle Analysis",
              "code": 1028,
              "link": "/control/lifecycle-analysis"
            },
            {
              "name": "Conversion Funnels",
              "code": 1698,
              "link": "/control/conversion-funnels"
            },
            {
              "name": "Converting Articles Report",
              "code": 2029,
              "link": "/control/converting-articles-report"
            },
            {
              "name": "Message Analysis",
              "code": 808,
              "link": "/control/message-analysis"
            },
            {
              "name": "Message Campaign Analysis",
              "code": 1590,
              "link": "/control/message-campaign-analysis"
            },
            {
              "name": "Mailing List Analysis",
              "code": 1594,
              "link": "/control/mailing-list-analysis"
            },
            {
              "name": "Mailing List Removal Log",
              "code": 2174,
              "link": "/control/mailing-list-removal-log"
            },
            {
              "name": "Referral Analysis",
              "code": 1625,
              "link": "/control/referral-analysis"
            }
          ]
        },
        {
          "name": "Ad Campaigns",
          "items": [
            {
              "name": "Advertisers",
              "code": 520,
              "link": "/control/advertisers"
            },
            {
              "name": "Creatives",
              "code": 524,
              "link": "/control/creatives"
            },
            {
              "name": "Ad Campaigns",
              "code": 519,
              "link": "/control/ad-campaigns"
            },
            {
              "name": "Ad Campaign Themes",
              "code": 525,
              "link": "/control/ad-campaign-themes"
            },
            {
              "name": "Ad Campaign Groups",
              "code": 1934,
              "link": "/control/ad-campaign-groups"
            }
          ]
        },
        {
          "name": "Messaging",
          "items": [
            {
              "name": "Messages",
              "code": 379,
              "link": "/control/messages"
            },
            {
              "name": "Message Campaigns",
              "code": 375,
              "link": "/control/message-campaigns"
            },
            {
              "name": "Message Templates",
              "code": 1794,
              "link": "/control/message-templates"
            },
            {
              "name": "Default Messages",
              "code": 1677,
              "link": "/control/default-messages"
            },
            {
              "name": "Mailing Lists",
              "code": 817,
              "link": "/control/mailing-lists"
            },
            {
              "name": "Bulk Mailing List Subscriptions",
              "code": 947,
              "link": "/control/bulk-mailing-list-subscriptions"
            },
            {
              "name": "Bulk Mailing List Unsubscribes",
              "code": 1701,
              "link": "/control/bulk-mailing-list-unsubscribes"
            }
          ]
        },
        {
          "name": "Manage",
          "items": [
            {
              "name": "UTM Link Builder",
              "code": 2171,
              "link": "/control/utm-link-builder"
            },
            {
              "name": "Customer Signals",
              "code": 1024,
              "link": "/control/customer-signals"
            },
            {
              "name": "Assign Customer Signals",
              "code": 1031,
              "link": "/control/assign-customer-signals"
            },
            {
              "name": "Overlay Panels",
              "code": 2082,
              "link": "/control/overlay-panels"
            },
            {
              "name": "Magic Links",
              "code": 2089,
              "link": "/control/magic-links"
            }
          ]
        },
        {
          "name": "Import Export",
          "items": [
            {
              "name": "Customer Signal Import",
              "code": 1823,
              "link": "/control/customer-signal-import"
            },
            {
              "name": "Mailing List Subscriber Import",
              "code": 606,
              "link": "/control/mailing-list-subscriber-import"
            }
          ]
        },
        {
          "name": "Settings",
          "items": [
            {
              "name": "Ads txt Profiles",
              "code": 2122,
              "link": "/control/ads-txt-profiles"
            },
            {
              "name": "Customer Lifecycles",
              "code": 1025,
              "link": "/control/customer-lifecycles"
            },
            {
              "name": "Share Buttons",
              "code": 929,
              "link": "/control/share-buttons"
            },
            {
              "name": "Share Profiles",
              "code": 930,
              "link": "/control/share-profiles"
            }
          ]
        }
      ]
    },
    {
      "name": "Commerce",
      "code": 874,
      "link": "/control/commerce",
      "icon": "shopping-cart",
      "sections": [
        {
          "name": "Sales Analysis",
          "items": [
            {
              "name": "Sales Leaderboard",
              "code": 1834,
              "link": "/control/sales-leaderboard"
            },
            {
              "name": "Sales Targets",
              "code": 2004,
              "link": "/control/sales-targets"
            },
            {
              "name": "Sales Report",
              "code": 1818,
              "link": "/control/sales-report"
            },
            {
              "name": "Sales Invoice Report",
              "code": 1837,
              "link": "/control/sales-invoice-report"
            },
            {
              "name": "Commerce Analysis",
              "code": 1620,
              "link": "/control/commerce-analysis"
            },
            {
              "name": "Coupons Report",
              "code": 1997,
              "link": "/control/coupons-report"
            },
            {
              "name": "Order Line Item Report",
              "code": 1819,
              "link": "/control/order-line-item-report"
            },
            {
              "name": "Previous Orders Report",
              "code": 1825,
              "link": "/control/previous-orders-report"
            },
            {
              "name": "Order Referral Analysis",
              "code": 997,
              "link": "/control/order-referral-analysis"
            },
            {
              "name": "Tax Period Summary Report",
              "code": 1838,
              "link": "/control/tax-period-summary-report"
            },
            {
              "name": "Tax Transactions Report",
              "code": 1826,
              "link": "/control/tax-transactions-report"
            }
          ]
        },
        {
          "name": "Subscription Analysis",
          "items": [
            {
              "name": "Subscription Dashboard",
              "code": 2135,
              "link": "/control/subscription-dashboard"
            },
            {
              "name": "Deferred Income Report",
              "code": 1831,
              "link": "/control/deferred-income-report"
            },
            {
              "name": "Subscription Expiry Report",
              "code": 1901,
              "link": "/control/subscription-expiry-report"
            },
            {
              "name": "Subscription Member Report",
              "code": 2036,
              "link": "/control/subscription-member-report"
            },
            {
              "name": "Subscription Volume Report",
              "code": 2069,
              "link": "/control/subscription-volume-report"
            },
            {
              "name": "Stop Code Report",
              "code": 1991,
              "link": "/control/stop-code-report"
            },
            {
              "name": "Media Subscription Report",
              "code": 960,
              "link": "/control/media-subscription-report"
            }
          ]
        },
        {
          "name": "Sales",
          "items": [
            {
              "name": "Orders",
              "code": 885,
              "link": "/control/orders"
            },
            {
              "name": "Pro Forma Orders",
              "code": 1808,
              "link": "/control/pro-forma-orders"
            },
            {
              "name": "Shopping Baskets",
              "code": 886,
              "link": "/control/shopping-baskets"
            },
            {
              "name": "Catalogue Items",
              "code": 880,
              "link": "/control/catalogue-items"
            },
            {
              "name": "Catalogue Groups",
              "code": 1978,
              "link": "/control/catalogue-groups"
            },
            {
              "name": "Inventories",
              "code": 881,
              "link": "/control/inventories"
            },
            {
              "name": "Batch Invoicing",
              "code": 2028,
              "link": "/control/batch-invoicing"
            },
            {
              "name": "Promotions",
              "code": 1981,
              "link": "/control/promotions"
            },
            {
              "name": "Coupons",
              "code": 883,
              "link": "/control/coupons"
            },
            {
              "name": "Coupon Groups",
              "code": 991,
              "link": "/control/coupon-groups"
            },
            {
              "name": "Discounts",
              "code": 884,
              "link": "/control/discounts"
            },
            {
              "name": "Service Credits",
              "code": 1051,
              "link": "/control/service-credits"
            },
            {
              "name": "Payment Gateway Webhooks",
              "code": 1992,
              "link": "/control/payment-gateway-webhooks"
            }
          ]
        },
        {
          "name": "Subscriptions",
          "items": [
            {
              "name": "Subscriptions",
              "code": 1802,
              "link": "/control/subscriptions"
            },
            {
              "name": "Subscription Plans",
              "code": 893,
              "link": "/control/subscription-plans"
            },
            {
              "name": "Subscription Renewal Profiles",
              "code": 1908,
              "link": "/control/subscription-renewal-profiles"
            },
            {
              "name": "Renewal Notices",
              "code": 1974,
              "link": "/control/renewal-notices"
            }
          ]
        },
        {
          "name": "Import Export",
          "items": [
            {
              "name": "Catalogue Items Import",
              "code": 980,
              "link": "/control/catalogue-items-import"
            },
            {
              "name": "Catalogue Items Export",
              "code": 899,
              "link": "/control/catalogue-items-export"
            },
            {
              "name": "Order Import",
              "code": 1879,
              "link": "/control/order-import"
            },
            {
              "name": "Order Batch Delete",
              "code": 1880,
              "link": "/control/order-batch-delete"
            },
            {
              "name": "Subscriber Export",
              "code": 2002,
              "link": "/control/subscriber-export"
            },
            {
              "name": "Coupon Import",
              "code": 992,
              "link": "/control/coupon-import"
            },
            {
              "name": "Catalogue Attributes Import",
              "code": 981,
              "link": "/control/catalogue-attributes-import"
            },
            {
              "name": "Catalogue Attribute Group Import",
              "code": 982,
              "link": "/control/catalogue-attribute-group-import"
            },
            {
              "name": "Catalogue Attribute Profiles Import",
              "code": 984,
              "link": "/control/catalogue-attribute-profiles-import"
            }
          ]
        },
        {
          "name": "Settings",
          "items": [
            {
              "name": "Catalogue Attributes",
              "code": 976,
              "link": "/control/catalogue-attributes"
            },
            {
              "name": "Catalogue Attribute Groups",
              "code": 977,
              "link": "/control/catalogue-attribute-groups"
            },
            {
              "name": "Catalogue Attribute Profiles",
              "code": 978,
              "link": "/control/catalogue-attribute-profiles"
            },
            {
              "name": "Checkout Profiles",
              "code": 1092,
              "link": "/control/checkout-profiles"
            },
            {
              "name": "Currencies",
              "code": 875,
              "link": "/control/currencies"
            },
            {
              "name": "Delivery Time Frames",
              "code": 1601,
              "link": "/control/delivery-time-frames"
            },
            {
              "name": "Google Base Profiles",
              "code": 1017,
              "link": "/control/google-base-profiles"
            },
            {
              "name": "Invoice Profiles",
              "code": 1019,
              "link": "/control/invoice-profiles"
            },
            {
              "name": "Order Lists",
              "code": 1020,
              "link": "/control/order-lists"
            },
            {
              "name": "Payment Gateways",
              "code": 897,
              "link": "/control/payment-gateways"
            },
            {
              "name": "Payment Methods",
              "code": 896,
              "link": "/control/payment-methods"
            },
            {
              "name": "Product Categories",
              "code": 1777,
              "link": "/control/product-categories"
            },
            {
              "name": "Product Lines",
              "code": 1780,
              "link": "/control/product-lines"
            },
            {
              "name": "Renewal Notice Profiles",
              "code": 1971,
              "link": "/control/renewal-notice-profiles"
            },
            {
              "name": "Service Credit Plans",
              "code": 894,
              "link": "/control/service-credit-plans"
            },
            {
              "name": "Service Credit Profiles",
              "code": 1052,
              "link": "/control/service-credit-profiles"
            },
            {
              "name": "Shipping Profiles",
              "code": 898,
              "link": "/control/shipping-profiles"
            },
            {
              "name": "Stop Codes",
              "code": 1988,
              "link": "/control/stop-codes"
            },
            {
              "name": "Store Credit Profiles",
              "code": 1591,
              "link": "/control/store-credit-profiles"
            },
            {
              "name": "Store Profiles",
              "code": 895,
              "link": "/control/store-profiles"
            },
            {
              "name": "Tax Codes",
              "code": 877,
              "link": "/control/tax-codes"
            },
            {
              "name": "Tax Rules",
              "code": 878,
              "link": "/control/tax-rules"
            },
            {
              "name": "Trading Zones",
              "code": 879,
              "link": "/control/trading-zones"
            }
          ]
        }
      ]
    },
    {
      "name": "AI",
      "code": 2136,
      "link": "/control/ai",
      "icon": "sparkles",
      "sections": [
        {
          "name": "Analysis",
          "items": [
            {
              "name": "AI Dashboard",
              "code": 2114,
              "link": "/control/ai-dashboard"
            },
            {
              "name": "AI Report",
              "code": 2105,
              "link": "/control/ai-report"
            }
          ]
        },
        {
          "name": "Manage",
          "items": [
            {
              "name": "AI Analyst",
              "code": 2140,
              "link": "/control/ai-analyst"
            },
            {
              "name": "Article Questions",
              "code": 2131,
              "link": "/control/article-questions"
            }
          ]
        },
        {
          "name": "Settings",
          "items": [
            {
              "name": "AI Profiles",
              "code": 2102,
              "link": "/control/ai-profiles"
            }
          ]
        }
      ]
    },
    {
      "name": "Media",
      "code": 871,
      "link": "/control/media",
      "icon": "images",
      "sections": [
        {
          "name": "Manage",
          "items": [
            {
              "name": "Media Inbox",
              "code": 951,
              "link": "/control/media-inbox"
            },
            {
              "name": "Media Items",
              "code": 461,
              "link": "/control/media-items"
            }
          ]
        },
        {
          "name": "Import Export",
          "items": [
            {
              "name": "Media Item Detail Import",
              "code": 1006,
              "link": "/control/media-item-detail-import"
            },
            {
              "name": "Media Image Export",
              "code": 1728,
              "link": "/control/media-image-export"
            },
            {
              "name": "Media File Path Export",
              "code": 990,
              "link": "/control/media-file-path-export"
            }
          ]
        },
        {
          "name": "Settings",
          "items": [
            {
              "name": "Media Image Profiles",
              "code": 858,
              "link": "/control/media-image-profiles"
            },
            {
              "name": "Media Library Profiles",
              "code": 860,
              "link": "/control/media-library-profiles"
            },
            {
              "name": "Media Upload Profiles",
              "code": 857,
              "link": "/control/media-upload-profiles"
            },
            {
              "name": "Media Provider Profiles",
              "code": 1023,
              "link": "/control/media-provider-profiles"
            },
            {
              "name": "Media Workflow Profiles",
              "code": 945,
              "link": "/control/media-workflow-profiles"
            }
          ]
        }
      ]
    },
    {
      "name": "Structure",
      "code": 854,
      "link": "/control/structure",
      "icon": "layout-panel-top",
      "sections": [
        {
          "name": "Analysis",
          "items": [
            {
              "name": "Channel Analysis",
              "code": 811,
              "link": "/control/channel-analysis"
            },
            {
              "name": "Deleted Item",
              "code": 2106,
              "link": "/control/deleted-item"
            }
          ]
        },
        {
          "name": "Manage",
          "items": [
            {
              "name": "Zones",
              "code": 772,
              "link": "/control/zones"
            },
            {
              "name": "Channels",
              "code": 2,
              "link": "/control/channels"
            },
            {
              "name": "Sections",
              "code": 31,
              "link": "/control/sections"
            }
          ]
        },
        {
          "name": "Import Export",
          "items": [
            {
              "name": "Section Import",
              "code": 2037,
              "link": "/control/section-import"
            }
          ]
        }
      ]
    },
    {
      "name": "Design",
      "code": 1629,
      "link": "/control/design",
      "icon": "palette",
      "sections": [
        {
          "name": "Manage",
          "items": [
            {
              "name": "Design Centre Usage",
              "code": 2176,
              "link": "/control/design-centre-usage"
            },
            {
              "name": "Design Objects",
              "code": 1630,
              "link": "/control/design-objects"
            },
            {
              "name": "Skins",
              "code": 1631,
              "link": "/control/skins"
            },
            {
              "name": "Menu",
              "code": 2010,
              "link": "/control/menu"
            },
            {
              "name": "Design Images",
              "code": 26,
              "link": "/control/design-images"
            }
          ]
        },
        {
          "name": "Styling",
          "items": [
            {
              "name": "Design Styles",
              "code": 1641,
              "link": "/control/design-styles"
            },
            {
              "name": "Cascading Style Sheets",
              "code": 1012,
              "link": "/control/cascading-style-sheets"
            },
            {
              "name": "Design Frames",
              "code": 1657,
              "link": "/control/design-frames"
            },
            {
              "name": "DataTables Styles",
              "code": 1876,
              "link": "/control/datatables-styles"
            }
          ]
        },
        {
          "name": "Template",
          "items": [
            {
              "name": "Standard Templates",
              "code": 788,
              "link": "/control/standard-templates"
            },
            {
              "name": "Standard Section Templates",
              "code": 827,
              "link": "/control/standard-section-templates"
            },
            {
              "name": "Media Templates",
              "code": 1035,
              "link": "/control/media-templates"
            },
            {
              "name": "Media Section Templates",
              "code": 1036,
              "link": "/control/media-section-templates"
            },
            {
              "name": "Template Management",
              "code": 826,
              "link": "/control/template-management"
            }
          ]
        },
        {
          "name": "Script",
          "items": [
            {
              "name": "Design Scripts",
              "code": 571,
              "link": "/control/design-scripts"
            },
            {
              "name": "Integration Scripts",
              "code": 604,
              "link": "/control/integration-scripts"
            }
          ]
        },
        {
          "name": "Settings",
          "items": [
            {
              "name": "Breakpoints",
              "code": 1636,
              "link": "/control/breakpoints"
            },
            {
              "name": "Breakpoint Profiles",
              "code": 1635,
              "link": "/control/breakpoint-profiles"
            },
            {
              "name": "Fonts",
              "code": 1072,
              "link": "/control/fonts"
            }
          ]
        }
      ]
    },
    {
      "name": "Security",
      "code": 598,
      "link": "/control/security",
      "icon": "shield",
      "sections": [
        {
          "name": "Analysis",
          "items": [
            {
              "name": "Audit",
              "code": 913,
              "link": "/control/audit"
            },
            {
              "name": "User Auto Archive Analysis",
              "code": 1922,
              "link": "/control/user-auto-archive-analysis"
            },
            {
              "name": "Bot Access Logs",
              "code": 2044,
              "link": "/control/bot-access-logs"
            }
          ]
        },
        {
          "name": "Manage",
          "items": [
            {
              "name": "User Merge",
              "code": 1940,
              "link": "/control/user-merge"
            },
            {
              "name": "User Security",
              "code": 4,
              "link": "/control/user-security"
            },
            {
              "name": "Pending Users",
              "code": 56,
              "link": "/control/pending-users"
            },
            {
              "name": "Content Security Rights",
              "code": 9,
              "link": "/control/content-security-rights"
            },
            {
              "name": "Security Groups",
              "code": 8,
              "link": "/control/security-groups"
            },
            {
              "name": "Assign Security Groups",
              "code": 1000,
              "link": "/control/assign-security-groups"
            },
            {
              "name": "Account Merge",
              "code": 1793,
              "link": "/control/account-merge"
            },
            {
              "name": "Barred Addresses",
              "code": 10,
              "link": "/control/barred-addresses"
            },
            {
              "name": "Email Blocks",
              "code": 504,
              "link": "/control/email-blocks"
            },
            {
              "name": "Error Log",
              "code": 1902,
              "link": "/control/error-log"
            },
            {
              "name": "Nickname Blocks",
              "code": 505,
              "link": "/control/nickname-blocks"
            },
            {
              "name": "Bulk Contact Update",
              "code": 824,
              "link": "/control/bulk-contact-update"
            }
          ]
        },
        {
          "name": "Integration",
          "items": [
            {
              "name": "OAuth Accounts",
              "code": 1090,
              "link": "/control/oauth-accounts"
            },
            {
              "name": "OAuth Profiles",
              "code": 1089,
              "link": "/control/oauth-profiles"
            }
          ]
        },
        {
          "name": "Import Export",
          "items": [
            {
              "name": "Account Export",
              "code": 1814,
              "link": "/control/account-export"
            },
            {
              "name": "Account Import",
              "code": 1685,
              "link": "/control/account-import"
            },
            {
              "name": "Account Batch Delete",
              "code": 2045,
              "link": "/control/account-batch-delete"
            },
            {
              "name": "User Import",
              "code": 761,
              "link": "/control/user-import"
            },
            {
              "name": "User Export",
              "code": 612,
              "link": "/control/user-export"
            },
            {
              "name": "User Batch Delete",
              "code": 2049,
              "link": "/control/user-batch-delete"
            },
            {
              "name": "User Permission Import",
              "code": 1916,
              "link": "/control/user-permission-import"
            },
            {
              "name": "User Permission Export",
              "code": 1906,
              "link": "/control/user-permission-export"
            },
            {
              "name": "User Preferences Import",
              "code": 1917,
              "link": "/control/user-preferences-import"
            },
            {
              "name": "User Preferences Export",
              "code": 1912,
              "link": "/control/user-preferences-export"
            }
          ]
        },
        {
          "name": "Settings",
          "items": [
            {
              "name": "Account Profiles",
              "code": 1945,
              "link": "/control/account-profiles"
            },
            {
              "name": "CRM Settings",
              "code": 1682,
              "link": "/control/crm-settings"
            },
            {
              "name": "User Profiles",
              "code": 773,
              "link": "/control/user-profiles"
            },
            {
              "name": "Registration Profiles",
              "code": 775,
              "link": "/control/registration-profiles"
            },
            {
              "name": "Demographic Profiles",
              "code": 776,
              "link": "/control/demographic-profiles"
            },
            {
              "name": "Member Types",
              "code": 914,
              "link": "/control/member-types"
            },
            {
              "name": "Permissions",
              "code": 1913,
              "link": "/control/permissions"
            },
            {
              "name": "Login Profiles",
              "code": 774,
              "link": "/control/login-profiles"
            },
            {
              "name": "Password Reset Profiles",
              "code": 778,
              "link": "/control/password-reset-profiles"
            },
            {
              "name": "User Auto Archive",
              "code": 1921,
              "link": "/control/user-auto-archive"
            },
            {
              "name": "Bot Access Profiles",
              "code": 2095,
              "link": "/control/bot-access-profiles"
            },
            {
              "name": "IP Address Filter",
              "code": 500,
              "link": "/control/ip-address-filter"
            }
          ]
        }
      ]
    },
    {
      "name": "System",
      "code": 596,
      "link": "/control/system",
      "icon": "settings",
      "sections": [
        {
          "name": "Analysis",
          "items": [
            {
              "name": "File Deletion Logs",
              "code": 2121,
              "link": "/control/file-deletion-logs"
            },
            {
              "name": "Search Analysis",
              "code": 691,
              "link": "/control/search-analysis"
            },
            {
              "name": "Data And Service Usage",
              "code": 2077,
              "link": "/control/data-and-service-usage"
            },
            {
              "name": "Storage Analysis",
              "code": 985,
              "link": "/control/storage-analysis"
            }
          ]
        },
        {
          "name": "Manage",
          "items": [
            {
              "name": "About",
              "code": 483,
              "link": "/control/about"
            },
            {
              "name": "Update",
              "code": 484,
              "link": "/control/update"
            },
            {
              "name": "Licence Key",
              "code": 510,
              "link": "/control/licence-key"
            },
            {
              "name": "Active Tasks",
              "code": 1627,
              "link": "/control/active-tasks"
            },
            {
              "name": "Scheduled Tasks",
              "code": 1612,
              "link": "/control/scheduled-tasks"
            },
            {
              "name": "Redirects",
              "code": 645,
              "link": "/control/redirects"
            }
          ]
        },
        {
          "name": "Import Export",
          "items": [
            {
              "name": "Redirect Import",
              "code": 1039,
              "link": "/control/redirect-import"
            },
            {
              "name": "Region And City Import",
              "code": 934,
              "link": "/control/region-and-city-import"
            },
            {
              "name": "Region And City Export",
              "code": 935,
              "link": "/control/region-and-city-export"
            }
          ]
        },
        {
          "name": "Settings",
          "items": [
            {
              "name": "Zapier API Logs",
              "code": 2168,
              "link": "/control/zapier-api-logs"
            },
            {
              "name": "Zapier Profiles",
              "code": 2151,
              "link": "/control/zapier-profiles"
            },
            {
              "name": "Agent Access Keys",
              "code": 2183,
              "link": "/control/agent-access-keys"
            },
            {
              "name": "Email Profiles",
              "code": 950,
              "link": "/control/email-profiles"
            },
            {
              "name": "Log Settings",
              "code": 692,
              "link": "/control/log-settings"
            },
            {
              "name": "Email Test Tool",
              "code": 54,
              "link": "/control/email-test-tool"
            },
            {
              "name": "Google Analytics Profiles",
              "code": 1009,
              "link": "/control/google-analytics-profiles"
            },
            {
              "name": "Google Sitemap Profiles",
              "code": 1016,
              "link": "/control/google-sitemap-profiles"
            },
            {
              "name": "Google Tag Manager Profiles",
              "code": 1687,
              "link": "/control/google-tag-manager-profiles"
            },
            {
              "name": "Search Profiles",
              "code": 822,
              "link": "/control/search-profiles"
            },
            {
              "name": "Product Search Profiles",
              "code": 1062,
              "link": "/control/product-search-profiles"
            },
            {
              "name": "Search Update",
              "code": 825,
              "link": "/control/search-update"
            },
            {
              "name": "Index Content",
              "code": 844,
              "link": "/control/index-content"
            },
            {
              "name": "Profanity Filter Settings",
              "code": 784,
              "link": "/control/profanity-filter-settings"
            },
            {
              "name": "Spam Prevention Profiles",
              "code": 1022,
              "link": "/control/spam-prevention-profiles"
            },
            {
              "name": "SMS Provider Profiles",
              "code": 1043,
              "link": "/control/sms-provider-profiles"
            },
            {
              "name": "PAF Provider Profiles",
              "code": 2060,
              "link": "/control/paf-provider-profiles"
            },
            {
              "name": "Cities",
              "code": 933,
              "link": "/control/cities"
            },
            {
              "name": "Regions",
              "code": 932,
              "link": "/control/regions"
            },
            {
              "name": "Region Groups",
              "code": 1574,
              "link": "/control/region-groups"
            },
            {
              "name": "Countries",
              "code": 1937,
              "link": "/control/countries"
            },
            {
              "name": "Country Groups",
              "code": 1929,
              "link": "/control/country-groups"
            },
            {
              "name": "IP Geolocation Profiles",
              "code": 995,
              "link": "/control/ip-geolocation-profiles"
            },
            {
              "name": "System Settings",
              "code": 19,
              "link": "/control/system-settings"
            },
            {
              "name": "Lookups",
              "code": 869,
              "link": "/control/lookups"
            },
            {
              "name": "API Profiles",
              "code": 1756,
              "link": "/control/api-profiles"
            },
            {
              "name": "Web Service Profiles",
              "code": 1001,
              "link": "/control/web-service-profiles"
            }
          ]
        }
      ]
    },
    {
      "name": "Custom",
      "code": 1607,
      "link": "/control/custom",
      "icon": "square-code",
      "sections": [
        {
          "name": "Custom",
          "items": [
            {
              "name": "Activate Imported Students",
              "code": 2067,
              "link": "/control/activate-imported-students"
            },
            {
              "name": "Adestra Profiles",
              "code": 1704,
              "link": "/control/adestra-profiles"
            },
            {
              "name": "Article Step By Step Import",
              "code": 1721,
              "link": "/control/article-step-by-step-import"
            },
            {
              "name": "Audit Companies",
              "code": 1762,
              "link": "/control/audit-companies"
            },
            {
              "name": "BASD Manage Catalogue Item Keywords",
              "code": 1738,
              "link": "/control/basd-manage-catalogue-item-keywords"
            },
            {
              "name": "BASD Manage Catalogue Items",
              "code": 1737,
              "link": "/control/basd-manage-catalogue-items"
            },
            {
              "name": "BASD Price Comparison Export",
              "code": 1754,
              "link": "/control/basd-price-comparison-export"
            },
            {
              "name": "BASD Price Comparison Export Settings",
              "code": 1753,
              "link": "/control/basd-price-comparison-export-settings"
            },
            {
              "name": "BM Article Export",
              "code": 2085,
              "link": "/control/bm-article-export"
            },
            {
              "name": "BMI Homepage Topics",
              "code": 1884,
              "link": "/control/bmi-homepage-topics"
            },
            {
              "name": "Book Directory",
              "code": 1771,
              "link": "/control/book-directory"
            },
            {
              "name": "Book List Management",
              "code": 1768,
              "link": "/control/book-list-management"
            },
            {
              "name": "Charity Audience Dashboard",
              "code": 1987,
              "link": "/control/charity-audience-dashboard"
            },
            {
              "name": "Charity Digital User Export",
              "code": 2088,
              "link": "/control/charity-digital-user-export"
            },
            {
              "name": "Charity Import",
              "code": 1985,
              "link": "/control/charity-import"
            },
            {
              "name": "Contentive API Logs",
              "code": 2074,
              "link": "/control/contentive-api-logs"
            },
            {
              "name": "Draft Book List Administration",
              "code": 1765,
              "link": "/control/draft-book-list-administration"
            },
            {
              "name": "FG CV Export",
              "code": 1928,
              "link": "/control/fg-cv-export"
            },
            {
              "name": "FG Homepage Topics",
              "code": 1751,
              "link": "/control/fg-homepage-topics"
            },
            {
              "name": "FG Jobs Export",
              "code": 1925,
              "link": "/control/fg-jobs-export"
            },
            {
              "name": "GE Account Export",
              "code": 1855,
              "link": "/control/ge-account-export"
            },
            {
              "name": "GE Account Import",
              "code": 1861,
              "link": "/control/ge-account-import"
            },
            {
              "name": "GE Schools",
              "code": 1761,
              "link": "/control/ge-schools"
            },
            {
              "name": "Gift Aid Export",
              "code": 1752,
              "link": "/control/gift-aid-export"
            },
            {
              "name": "IAC Destinations",
              "code": 1862,
              "link": "/control/iac-destinations"
            },
            {
              "name": "IBD Manage Catalogue Items",
              "code": 1726,
              "link": "/control/ibd-manage-catalogue-items"
            },
            {
              "name": "IH Homepage Topics",
              "code": 1891,
              "link": "/control/ih-homepage-topics"
            },
            {
              "name": "LBR API Logs",
              "code": 2086,
              "link": "/control/lbr-api-logs"
            },
            {
              "name": "LBR Bio Import",
              "code": 2116,
              "link": "/control/lbr-bio-import"
            },
            {
              "name": "LBR Bulk Assign Bio QA",
              "code": 1967,
              "link": "/control/lbr-bulk-assign-bio-qa"
            },
            {
              "name": "LBR Bulk Edition Export",
              "code": 2137,
              "link": "/control/lbr-bulk-edition-export"
            },
            {
              "name": "LBR Data Export",
              "code": 1968,
              "link": "/control/lbr-data-export"
            },
            {
              "name": "LBR Edition Comments",
              "code": 1958,
              "link": "/control/lbr-edition-comments"
            },
            {
              "name": "LBR Editions Comments Batch Delete",
              "code": 2094,
              "link": "/control/lbr-editions-comments-batch-delete"
            },
            {
              "name": "LBR Editions Comments Import",
              "code": 2093,
              "link": "/control/lbr-editions-comments-import"
            },
            {
              "name": "LBR Production Dashboard Editions",
              "code": 1957,
              "link": "/control/lbr-production-dashboard-editions"
            },
            {
              "name": "LBR Send Email Proof",
              "code": 1970,
              "link": "/control/lbr-send-email-proof"
            },
            {
              "name": "LBR Settings",
              "code": 2031,
              "link": "/control/lbr-settings"
            },
            {
              "name": "LiveBuzz Mappings",
              "code": 2001,
              "link": "/control/livebuzz-mappings"
            },
            {
              "name": "Long Running Queries",
              "code": 2172,
              "link": "/control/long-running-queries"
            },
            {
              "name": "Message Testing",
              "code": 2059,
              "link": "/control/message-testing"
            },
            {
              "name": "OMG API Logs",
              "code": 2070,
              "link": "/control/omg-api-logs"
            },
            {
              "name": "OMG CIH Import",
              "code": 2068,
              "link": "/control/omg-cih-import"
            },
            {
              "name": "OMG Demographic Report",
              "code": 2113,
              "link": "/control/omg-demographic-report"
            },
            {
              "name": "Rarik Documents",
              "code": 1885,
              "link": "/control/rarik-documents"
            },
            {
              "name": "Redemption Codes",
              "code": 1744,
              "link": "/control/redemption-codes"
            },
            {
              "name": "Remote Error Log",
              "code": 2055,
              "link": "/control/remote-error-log"
            },
            {
              "name": "Review Contact Import",
              "code": 2110,
              "link": "/control/review-contact-import"
            },
            {
              "name": "SH Homepage Topics",
              "code": 1892,
              "link": "/control/sh-homepage-topics"
            },
            {
              "name": "SagePay Payment Schedule",
              "code": 2003,
              "link": "/control/sagepay-payment-schedule"
            },
            {
              "name": "Salesforce Group Mappings",
              "code": 1074,
              "link": "/control/salesforce-group-mappings"
            },
            {
              "name": "Salesforce Profiles",
              "code": 1045,
              "link": "/control/salesforce-profiles"
            },
            {
              "name": "Salesforce User Sync Approval",
              "code": 1060,
              "link": "/control/salesforce-user-sync-approval"
            },
            {
              "name": "Speeddata Mappings",
              "code": 1873,
              "link": "/control/speeddata-mappings"
            },
            {
              "name": "Subscriber Dashboard",
              "code": 2109,
              "link": "/control/subscriber-dashboard"
            },
            {
              "name": "TS Analytics Dashboard",
              "code": 2115,
              "link": "/control/ts-analytics-dashboard"
            },
            {
              "name": "TTG Homepage Topics",
              "code": 1850,
              "link": "/control/ttg-homepage-topics"
            },
            {
              "name": "The Book Seller Chart Import",
              "code": 2040,
              "link": "/control/the-book-seller-chart-import"
            },
            {
              "name": "The Book Seller Indesign Export",
              "code": 2042,
              "link": "/control/the-book-seller-indesign-export"
            },
            {
              "name": "The Book Seller Previews Import",
              "code": 2041,
              "link": "/control/the-book-seller-previews-import"
            },
            {
              "name": "WCN Homepage Topics",
              "code": 1870,
              "link": "/control/wcn-homepage-topics"
            },
            {
              "name": "Whitelists",
              "code": 2046,
              "link": "/control/whitelists"
            },
            {
              "name": "Yudu Activation Keys",
              "code": 1610,
              "link": "/control/yudu-activation-keys"
            }
          ]
        }
      ]
    }
  ],
  "analysis": [
    {
      "name": "CRM",
      "icon": "user-cog",
      "items": [
        {
          "name": "Audience Dashboard",
          "code": 1986,
          "link": "/control/audience-dashboard"
        },
        {
          "name": "Live Users",
          "code": 511,
          "link": "/control/live-users"
        },
        {
          "name": "CRM Analysis",
          "code": 1703,
          "link": "/control/crm-analysis"
        },
        {
          "name": "Accounts Report",
          "code": 1976,
          "link": "/control/accounts-report"
        },
        {
          "name": "Opportunity Analysis",
          "code": 1582,
          "link": "/control/opportunity-analysis"
        },
        {
          "name": "Project Analysis",
          "code": 1725,
          "link": "/control/project-analysis"
        },
        {
          "name": "Contract Analysis",
          "code": 1702,
          "link": "/control/contract-analysis"
        },
        {
          "name": "Bill Analysis",
          "code": 1743,
          "link": "/control/bill-analysis"
        },
        {
          "name": "User Analysis",
          "code": 688,
          "link": "/control/user-analysis"
        },
        {
          "name": "Networking Analysis",
          "code": 1720,
          "link": "/control/networking-analysis"
        },
        {
          "name": "Social Wall",
          "code": 1595,
          "link": "/control/social-wall"
        },
        {
          "name": "Email Send Logs",
          "code": 2033,
          "link": "/control/email-send-logs"
        },
        {
          "name": "Email Notifications",
          "code": 1998,
          "link": "/control/email-notifications"
        },
        {
          "name": "Awards Analysis",
          "code": 1899,
          "link": "/control/awards-analysis"
        },
        {
          "name": "Directory Messaging Report",
          "code": 2034,
          "link": "/control/directory-messaging-report"
        },
        {
          "name": "On Page Feedback Analysis",
          "code": 1839,
          "link": "/control/on-page-feedback-analysis"
        },
        {
          "name": "Job Application Analysis",
          "code": 1898,
          "link": "/control/job-application-analysis"
        }
      ]
    },
    {
      "name": "Content",
      "icon": "file-text",
      "items": [
        {
          "name": "Analysis Dashboard",
          "code": 2056,
          "link": "/control/analysis-dashboard"
        },
        {
          "name": "Live Dashboard",
          "code": 829,
          "link": "/control/live-dashboard"
        },
        {
          "name": "Site Analysis",
          "code": 912,
          "link": "/control/site-analysis"
        },
        {
          "name": "Articles Report",
          "code": 1984,
          "link": "/control/articles-report"
        },
        {
          "name": "Content Analysis",
          "code": 687,
          "link": "/control/content-analysis"
        },
        {
          "name": "Broken Links",
          "code": 968,
          "link": "/control/broken-links"
        },
        {
          "name": "Unused Content",
          "code": 820,
          "link": "/control/unused-content"
        },
        {
          "name": "Top Visits",
          "code": 1843,
          "link": "/control/top-visits"
        },
        {
          "name": "Content Subscription Analysis",
          "code": 949,
          "link": "/control/content-subscription-analysis"
        }
      ]
    },
    {
      "name": "Marketing",
      "icon": "megaphone",
      "items": [
        {
          "name": "Ad Campaign Analysis",
          "code": 689,
          "link": "/control/ad-campaign-analysis"
        },
        {
          "name": "Campaign Dashboards",
          "code": 2078,
          "link": "/control/campaign-dashboards"
        },
        {
          "name": "Lifecycle Analysis",
          "code": 1028,
          "link": "/control/lifecycle-analysis"
        },
        {
          "name": "Conversion Funnels",
          "code": 1698,
          "link": "/control/conversion-funnels"
        },
        {
          "name": "Converting Articles Report",
          "code": 2029,
          "link": "/control/converting-articles-report"
        },
        {
          "name": "Message Analysis",
          "code": 808,
          "link": "/control/message-analysis"
        },
        {
          "name": "Message Campaign Analysis",
          "code": 1590,
          "link": "/control/message-campaign-analysis"
        },
        {
          "name": "Mailing List Analysis",
          "code": 1594,
          "link": "/control/mailing-list-analysis"
        },
        {
          "name": "Mailing List Removal Log",
          "code": 2174,
          "link": "/control/mailing-list-removal-log"
        },
        {
          "name": "Referral Analysis",
          "code": 1625,
          "link": "/control/referral-analysis"
        }
      ]
    },
    {
      "name": "Commerce",
      "icon": "shopping-cart",
      "items": [
        {
          "name": "Sales Leaderboard",
          "code": 1834,
          "link": "/control/sales-leaderboard"
        },
        {
          "name": "Sales Targets",
          "code": 2004,
          "link": "/control/sales-targets"
        },
        {
          "name": "Sales Report",
          "code": 1818,
          "link": "/control/sales-report"
        },
        {
          "name": "Sales Invoice Report",
          "code": 1837,
          "link": "/control/sales-invoice-report"
        },
        {
          "name": "Commerce Analysis",
          "code": 1620,
          "link": "/control/commerce-analysis"
        },
        {
          "name": "Coupons Report",
          "code": 1997,
          "link": "/control/coupons-report"
        },
        {
          "name": "Order Line Item Report",
          "code": 1819,
          "link": "/control/order-line-item-report"
        },
        {
          "name": "Previous Orders Report",
          "code": 1825,
          "link": "/control/previous-orders-report"
        },
        {
          "name": "Order Referral Analysis",
          "code": 997,
          "link": "/control/order-referral-analysis"
        },
        {
          "name": "Tax Period Summary Report",
          "code": 1838,
          "link": "/control/tax-period-summary-report"
        },
        {
          "name": "Tax Transactions Report",
          "code": 1826,
          "link": "/control/tax-transactions-report"
        },
        {
          "name": "Subscription Dashboard",
          "code": 2135,
          "link": "/control/subscription-dashboard"
        },
        {
          "name": "Deferred Income Report",
          "code": 1831,
          "link": "/control/deferred-income-report"
        },
        {
          "name": "Subscription Expiry Report",
          "code": 1901,
          "link": "/control/subscription-expiry-report"
        },
        {
          "name": "Subscription Member Report",
          "code": 2036,
          "link": "/control/subscription-member-report"
        },
        {
          "name": "Subscription Volume Report",
          "code": 2069,
          "link": "/control/subscription-volume-report"
        },
        {
          "name": "Stop Code Report",
          "code": 1991,
          "link": "/control/stop-code-report"
        },
        {
          "name": "Media Subscription Report",
          "code": 960,
          "link": "/control/media-subscription-report"
        }
      ]
    },
    {
      "name": "AI",
      "icon": "sparkles",
      "items": [
        {
          "name": "AI Dashboard",
          "code": 2114,
          "link": "/control/ai-dashboard"
        },
        {
          "name": "AI Report",
          "code": 2105,
          "link": "/control/ai-report"
        }
      ]
    },
    {
      "name": "Structure",
      "icon": "layout-panel-top",
      "items": [
        {
          "name": "Channel Analysis",
          "code": 811,
          "link": "/control/channel-analysis"
        },
        {
          "name": "Deleted Item",
          "code": 2106,
          "link": "/control/deleted-item"
        }
      ]
    },
    {
      "name": "Security",
      "icon": "shield",
      "items": [
        {
          "name": "Audit",
          "code": 913,
          "link": "/control/audit"
        },
        {
          "name": "User Auto Archive Analysis",
          "code": 1922,
          "link": "/control/user-auto-archive-analysis"
        },
        {
          "name": "Bot Access Logs",
          "code": 2044,
          "link": "/control/bot-access-logs"
        }
      ]
    },
    {
      "name": "System",
      "icon": "settings",
      "items": [
        {
          "name": "File Deletion Logs",
          "code": 2121,
          "link": "/control/file-deletion-logs"
        },
        {
          "name": "Search Analysis",
          "code": 691,
          "link": "/control/search-analysis"
        },
        {
          "name": "Data And Service Usage",
          "code": 2077,
          "link": "/control/data-and-service-usage"
        },
        {
          "name": "Storage Analysis",
          "code": 985,
          "link": "/control/storage-analysis"
        }
      ]
    }
  ]
};
