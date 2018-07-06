var app = angular.module("MenuModule", []);

app.controller("MenuController", ['$scope', function ($scope) {

    var items = {
        "PA": [
            {"menuId": 1, "title": "Ready", "description": "Ready link for phone agents", "href": "#!/pa/dashboard",
                "sublinks": [
                    {"title": "Barge", "href": "#!/ready-to-barge"}
                ]},
            {"menuId": 2, "title": "Transfer", "description": "Transfer link for phone agents", "href": "#!/pa-ready-transfer",
                "sublinks": [
                    {"title": "External Number", "href": "#!/pa-external-number"},
                    {"title": "Queue", "href": "#!/pa-queue"},
                    {"title": "Extension", "href": "#!/pa-extension"}
                ]
            },
            {"menuId": 4, "title": "Voicemail", "description": "Voicemail links for phone agents", "href": "#!/pa/pa-voicemail-setup",
                "sublinks": [
                    {"title": "Set Your Greeting", "href": "#!/pa/pa-voicemail-setup"},
                    {"title": "Listen to Messages", "href": "#!/pa/check-messages"},
                    {"title": "Call Forward", "href": "#!/pa/call-forwarding"}
                ]},
            {"menuId": 5, "title": "Web Phone", "description": "Web Phone for phone agents", "href": "#!/pa/web-phone",
                "sublinks": [
                    {"title": "Pause", "href": "#!/pa-webphone-pause"},
                    {"title": "Logout", "href": "#!/pa-webphone-logout"},
                    {"title": "Place on Hold", "href": "#!/pa-webphone-onhold"}
                ]},
            {"menuId": 6, "title": "Calls", "description": "Call history for phone agents", "href": "#!/pa/call-history",
                "sublinks": []
            },
            {"menuId": 7, "title": "Leads", "description": "Lead Managment", "href": "#!/pa/list-caller-leads",
                "sublinks": []
            },
            {"menuId": 8, "title": "Calendar", "description": "Calendar demo", "href": "#!/pa/calendar",
                "sublinks": []
            }
        ],
        "LG": [
            {"menuId": 1, "title": "Dashboard", "description": "Dash link for lead seller", "href": "#!/lg/dashboard",
                "sublinks": []
            },
            {"menuId": 2, "title": "Offers", "description": "Offers link for lead seller", "href": "#!/lg/view-all-offer",
                "sublinks": [
                    {"title": "View All", "href": "#!/lg/view-all-offer"}
                ]},
            {"menuId": 3, "title": "Campaigns", "description": "Campaigns link for lead seller", "href": "#!/lg/LG-create-campaign",
                "sublinks": [
                    {"title": "Create a Campaign", "href": "#!/lg/LG-create-campaign"},
                    {"title": "View Current Campaigns", "href": "#!/lg/current-campaigns"}
                ]},
            {"menuId": 4, "title": "Phone", "description": "Phone link for lead sellers", "href": "#!/lg/phone-numbers",
                "sublinks": [
//                    {"title": "Agents", "href": "#!/advcc/phone-agents"},
                    {"title": "Numbers", "href": "#!/lg/phone-numbers"},
//                    {"title": "Extensions", "href": "#!//advcc/phone-extension"}
                ]},
            {"menuId": 3, "title": "Calls", "description": "Calls link for lead seller", "href": "#!/lg/lead-sellers-calls",
                "sublinks": []
            },
            {"menuId": 3, "title": "Call Routing", "description": "Call Routing for lead seller", "href": "#!/lg/manage-call-routing",
                "sublinks": [
                    {"title": "Manage Call Routing", "href": "#!/lg/manage-call-routing"},
                    {"title": "Prompts", "href": "#!/lg/call-routing-prompts"},
                    {"title": "IVR-Based", "href": "#!/lg/call-routing-ivr"},
//                    {"title": "Hours of Operation", "href": "#!/lb/hours-of-operation"},
//                    {"title": "Geographic", "href": "#!/lb/call-routing-geographic"},
//                    {"title":"Campaigns", "href":"#!/lb/call-routing-campaigns"},
//                    {"title": "Concurrent Calls", "href": "#!/lb/call-routing-concurrent-calls"}

                ]
            },
            {"menuId": 5, "title": "Accounting", "description": "Accounting", "href": "#!/lg/add-payment-type",
                "sublinks": [
                    {"title": "Add Payment Type", "href": "#!/lg/add-payment-type"},
                    {"title": "Accounts Receivable", "href": "#!/lg/accounts-receivable"},
                    {"title": "Accounts Payable", "href": "#!/lg/accounts-payable"},
                    {"title": "Payment History", "href": "#!/lg/payment-history"},
                    {"title": "Send a One-Time Invoice", "href": "#!/lg/send-one-time-invoice"},
//                    {"title": "Invoice Template", "href": "#!/lg/invoice-template"}
                ]
            },
            {"menuId": 6, "title": "Leads", "description": "Lead Managment", "href": "#!/lg/list-caller-leads",
                "sublinks": []
            },
        ],
        "LB": [
            {"menuId": 1, "title": "Dashboard", "description": "Dash link for lead buyers", "href": "#!/lb/dashboard",
                "sublinks": []
            },
            {"menuId": 2, "title": "Offers", "description": "Offers link for lead buyes", "href": "#!/lb/list-offers",
                "sublinks": [
                    {"title": "View All Offers", "href": "#!/lb/list-offers"},
                    {"title": "Create an Offer", "href": "#!/lb/create-an-offer"}
                ]},
            {"menuId": 3, "title": "Campaigns", "description": "Campaigns link for lead buyers", "href": "#!/lb/LG-create-campaign",
                "sublinks": [
                    {"title": "Create a Campaign", "href": "#!/lb/LG-create-campaign"},
                    {"title": "View Active Campaigns", "href": "#!/lb/active-campaigns"}
                ]},
            {"menuId": 4, "title": "Phone", "description": "Phone link for lead sellers", "href": "#!/lb/phone-numbers",
                "sublinks": [
//                    {"title": "Agents", "href": "#!/advcc/phone-agents"},
                    {"title": "Numbers", "href": "#!/lb/phone-numbers"},
//                    {"title": "Extensions", "href": "#!//advcc/phone-extension"}
                ]},
//      Removed on 11-Dec-2015
//            {"menuId": 3, "title": "Phone", "description": "Phone link for lead buyers", "href": "#!/lb/phone-agents",
//                "sublinks": [
//                    {"title": "Agents", "href": "#!/lb/phone-agents"},
//                    {"title": "Numbers", "href": "#!/lb/phone-numbers"},
//                    {"title": "Extensions", "href": "#!/pa-extensions"},
//                    {"title": "Queues", "href": "#!/pa-queues"}
//                ]},
//            {"menuId": 3, "title": "Payment", "description": "Payment link for lead buyers", "href": "#!/lead-buyers-payment",
//                "sublinks": [
//                    {"title": "History", "href": "#!/lead-buyers-payment-history"},
//                    {"title": "Bank Details", "href": "#!/lead-buyers-bank-details"},
//                    {"title": "Options", "href": "#!/lead-buyers-payment-options"}
//                ]},
//            {"menuId": 4, "title": "IVR", "description": "IVR Option", "href": "#!/lead-buyer-IVR",
//                "sublinks": [
//                    {"title": "Create", "href": "#!/lb/LB-create-IVR"},
//                    {"title": "View All", "href": "#!/lb/LB-view-IVR"}
//                ]
//            },
            {"menuId": 3, "title": "Call Routing", "description": "Call Routing for lead seller", "href": "#!/lb/manage-call-routing",
                "sublinks": [
                    {"title": "Manage Call Routing", "href": "#!/lb/manage-call-routing"},
                    {"title": "Prompts", "href": "#!/lb/call-routing-prompts"},
                    {"title": "IVR-Based", "href": "#!/lb/call-routing-ivr"},
//                    {"title": "Hours of Operation", "href": "#!/lb/hours-of-operation"},
//                    {"title": "Geographic", "href": "#!/lb/call-routing-geographic"},
//                    {"title":"Campaigns", "href":"#!/lb/call-routing-campaigns"},
//                    {"title": "Concurrent Calls", "href": "#!/lb/call-routing-concurrent-calls"}

                ]
            },
            {"menuId": 5, "title": "Accounting", "description": "Accounting", "href": "#!/lb/add-payment-type",
                "sublinks": [
                    {"title": "Add Payment Type", "href": "#!/lb/add-payment-type"},
                    {"title": "Accounts Receivable", "href": "#!/lb/accounts-receivable"},
                    {"title": "Accounts Payable", "href": "#!/lb/accounts-payable"},
                    {"title": "Payment History", "href": "#!/lb/payment-history"},
                    {"title": "Send a One-Time Invoice", "href": "#!/lb/send-one-time-invoice"},
//                    {"title": "Invoice Template", "href": "#!/lb/invoice-template"}
                ]
            },
            {"menuId": 6, "title": "Leads", "description": "Lead Managment", "href": "#!/lb/list-caller-leads",
                "sublinks": []
            },
        ],
        "LGN": [
            {"menuId": 1, "title": "Dashboard", "description": "Dashboard link for lead Gen Network", "href": "#!/lgn/dashboard",
                "sublinks": []
            },
            {"menuId": 2, "title": "User Agreement", "description": "User Agreement", "href": "#!/lgn/agreements",
                "sublinks": []
            },
            {"menuId": 2, "title": "Onboard", "description": "Onboard link for lead Gen network", "href":"#!/lgn/onboard-an-LB",
                "sublinks": [
                    {"title": "New Lead Buyer", "href": "#!/lgn/onboard-an-LB"},
                    {"title": "New Lead Seller", "href": "#!/lgn/new_lead_seller"}
                ]},
            {"menuId": 3, "title": "Calls", "description": "Calls link for lead Gen network", "href": "#!/lgn/call-gen-all-calls",
                "sublinks": [
                    {"title": "View All", "href": "#!/lgn/call-gen-all-calls"},
                    {"title": "Approve Payable Calls", "href": "#!/lgn/approve-pay-calls"}
                ]},
            {"menuId": 3, "title": "View", "description": "View link for lead gen network", "href": "/#!/lgn/userLB",
                "sublinks": [
                    {"title": "Lead Buyers", "href": "#!/lgn/userLB"},
                    {"title": "Lead Sellers", "href": "#!/lgn/userLG"},
                    {"title": "Phone Numbers", "href": "#!/lgn/phone-numbers"}
                ]},
            {"menuId": 3, "title": "CRM", "description": "CRM link for lead gen network", "href": "#!/lgn/crm-setup",
                "sublinks": [
                    {"title": "CRM Setup", "href": "#!/lgn/crm-setup"},
                    {"title": "View Leads", "href": "#!/lgn/view-leads"},
                    {"title": "Turn off CRM", "href": "#!/lgn/turn-off-crm"}
                ]},
            {"menuId": 3, "title": "Call Routing", "description": "Call Routing for lead gen network", "href": "#!/lgn/manage-call-routing",
                "sublinks": [
                    {"title": "Manage Call Routing", "href": "#!/lgn/manage-call-routing"},
                    {"title": "Prompts", "href": "#!/lgn/call-routing-prompts"},
                    {"title": "IVR-Based", "href": "#!/lgn/call-routing-ivr"},
//                    {"title": "Hours of Operation", "href": "#!/lgn/hours-of-operation"},
//                    {"title": "Geographic", "href": "#!/lgn/call-routing-geographic"},
//                    {"title":"Campaigns", "href":"#!/lgn/call-routing-campaigns"},
//                    {"title": "Concurrent Calls", "href": "#!/lgn/call-routing-concurrent-calls"}
                ]
            },
            {"menuId": 5, "title": "Accounting", "description": "Accounting", "href": "#!/lgn/add-payment-type",
                "sublinks": [
                    {"title": "Add Payment Type", "href": "#!/lgn/add-payment-type"},
                    {"title": "Accounts Receivable", "href": "#!/lgn/accounts-receivable"},
                    {"title": "Accounts Payable", "href": "#!/lgn/accounts-payable"},
                    {"title": "Payment History", "href": "#!/lgn/payment-history"},
                    {"title": "Send a One-Time Invoice", "href": "#!/lgn/send-one-time-invoice"},
//                    {"title": "Invoice Template", "href": "#!/lgn/invoice-template"}
                ]
            },
            {"menuId": 6, "title": "Leads", "description": "Lead Managment", "href": "#!/lgn/list-caller-leads",
                "sublinks": []
            }
        ],
        "ADMIN": [
            {"menuId": 1, "title": "Dashboard", "description": "SAAS dashboard", "href": "#!/admin/dashboard",
                "sublinks": []
            },
            {"menuId": 2, "title": "User Agreement", "description": "User Agreement", "href": "#!/admin/agreements",
                "sublinks": []
            },
            {"menuId": 3, "title": "Lead Gen Networks", "description": "Lead Gen Networks link for SAAS", "href": "#!/admin/onboard-an-LGN",
                "sublinks": [
                    {"title": "Onboard New", "href": "#!/admin/onboard-an-LGN"},
                    {"title": "View Current", "href": "#!/admin/userLGN"}
                ]
            },
            {"menuId": 4, "title": "Management", "description": "All managemet sections", "href": "#!/admin/vertical",
                "sublinks": [{"title": "Verticals", "href": "#!/admin/vertical"},
                    {"title": "Categories", "href": "#!/admin/category"},
                    {"title": "Roles", "href": "#!/admin/role"},
                    {"title": "Campaigns", "href": "#!/admin/campaign"}]},
            {"menuId": 5, "title": "View", "description": "All user management links for SAAS", "href": "#!/admin/userLB",
                "sublinks": [{"title": "Buyers", "href": "#!/admin/userLB"},
                    {"title": "Sellers", "href": "#!/admin/userLS"},
                    {"title": "Phone Agents", "href": "#!/admin/userPA"},
                    {"title": "Lead Gen Networks", "href": "#!/admin/userLGN"},
                    {"title": "ADVCC", "href": "#!/admin/userADVCC"}]},
            {"menuId": 6, "title": "Original Offer", "description": "Add Original Offer", "href": "#!/admin/list-offer-template",
                "sublinks": [{"title": "List Offer Template", "href": "#!/admin/list-offer-template"},
                    {"title": "Create Offer Template", "href": "#!/admin/original-offer"}
                ]},
            // {"menuId": 6, "title": "NACHA", "description": "NACHA link for SAAS", "href": "#!/nacha",
            //     "sublinks": [
            //         {"title": "Create NACHA file", "href": "#!/admin/create-nacha-file"},
            //         {"title": "Upload return file", "href": "#!/admin/upload-return-file"},
            //     ]},
            {"menuId": 7, "title": "Accounting", "description": "Accounting", "href": "#!/admin/add-payment-type",
                "sublinks": [
                    {"title": "Add Payment Type", "href": "#!/admin/add-payment-type"},
                    {"title": "Accounts Receivable", "href": "#!/admin/accounts-receivable"},
                    {"title": "Payment History", "href": "#!/admin/payment-history"},
                    {"title": "Send a One-Time Invoice", "href": "#!/admin/send-one-time-invoice"},
//                    {"title": "Invoice Template", "href": "#!/admin/invoice-template"}
                ]
            },
            {"menuId": 8, "title": "Leads", "description": "Lead Managment", "href": "#!/admin/list-caller-leads",
                "sublinks": []
            }
        ],
        "ADVCC": [{"menuId": 1, "title": "Dashboard", "description": "Dash link for lead buyers", "href": "#!/advcc/dashboard",
                "sublinks": []
            },
            {"menuId": 2, "title": "Offers", "description": "Offers link for lead buyes", "href": "#!/advcc/list-offers",
                "sublinks": [
                    {"title": "View All Offers", "href": "#!/advcc/list-offers"},
                    {"title": "Create an Offer", "href": "#!/advcc/create-an-offer"}
                ]},
            {"menuId": 3, "title": "Campaigns", "description": "Campaigns link for lead buyers", "href": "#!/advcc/ADVCC-create-campaign",
                "sublinks": [
                    {"title": "Create a Campaign", "href": "#!/advcc/ADVCC-create-campaign"},
                    {"title": "View Active Campaigns", "href": "#!/advcc/active-campaigns"}
                ]},
            {"menuId": 3, "title": "Phone", "description": "Phone link for lead buyers", "href": "#!/advcc/phone-agents",
                "sublinks": [
                    {"title": "Agents", "href": "#!/advcc/phone-agents"},
                    {"title": "Numbers", "href": "#!/advcc/phone-numbers"},
                    {"title": "Agent Script", "href": "#!/advcc/list-agent-script"},
                    {"title": "Calendar Script", "href": "#!/advcc/list-calendar-script"}
                ]},
//                {"menuId":3, "title":"Payment", "description":"Payment link for lead buyers","href":"#!",
//                     "sublinks":[
//                        {"title":"History", "href":"#!"},
//                        {"title":"Bank Details", "href":"#!"},
//                        {"title":"Options", "href":"#!"}
//                ]},
//                {"menuId":4, "title":"IVR", "description":"IVR Option","href":"#!",
//                     "sublinks":[
//                        {"title":"Create", "href":"#!"},
//                        {"title":"View All", "href":"#!"}
//                     ]
//                },

            {"menuId": 6, "title": "Queues", "description": "Queues", "href": "#!/advcc/queues",
                "sublinks": []},
            {"menuId": 3, "title": "Call Routing", "description": "Call Routing for ADVCC", "href": "#!/advcc/manage-call-routing",
                "sublinks": [
                    {"title": "Manage Call Routing", "href": "#!/advcc/manage-call-routing"},
                    {"title": "Prompts", "href": "#!/advcc/call-routing-prompts"},
                    {"title": "IVR-Based", "href": "#!/advcc/call-routing-ivr"},
//                    {"title": "Hours of Operation", "href": "#!/advcc/hours-of-operation"},
//                    {"title": "Geographic", "href": "#!/advcc/call-routing-geographic"},
//                    {"title":"Campaigns", "href":"#!/advcc/call-routing-campaigns"},
//                    {"title": "Concurrent Calls", "href": "#!/advcc/call-routing-concurrent-calls"},
                    {"title": "Inbound Trunk", "href": "#!/advcc/inbound-trunk"}
                ]
            },
            {"menuId": 7, "title": "Accounting", "description": "Accounting", "href": "#!/advcc/add-payment-type",
                "sublinks": [
                    {"title": "Add Payment Type", "href": "#!/advcc/add-payment-type"},
                    {"title": "Accounts Receivable", "href": "#!/advcc/accounts-receivable"},
                    {"title": "Accounts Payable", "href": "#!/advcc/accounts-payable"},
                    {"title": "Payment History", "href": "#!/advcc/payment-history"},
                    {"title": "Send a One-Time Invoice", "href": "#!/advcc/send-one-time-invoice"},
//                    {"title": "Invoice Template", "href": "#!/advcc/invoice-template"}
                ]
            },
            {"menuId": 8, "title": "In house Media Agency", "description": "Accounting", "href": "#!/advcc/media-creation/request",
                "sublinks": [
                    {"title": "Media Creation", "href": "#!/advcc/media-creation/request"}
//                    {"title": "Attribution Campaign", "href": "#!/advcc/attribution-campaign"}
                ]
            },
            {"menuId": 7, "title": "Leads", "description": "Lead Managment", "href": "#!/advcc/list-caller-leads",
                "sublinks": []
            },
        ],
        "GUEST": [
            {"menuId": 1, "title": "Home", "description": "Home", "href": "#!/",
                "sublinks": []},
            {"menuId": 2, "title": "About us", "description": "About us", "href": "#!/about-us",
                "sublinks": []},
            {"menuId": 3, "title": "Pricing", "description": "Pricing", "href": "#!/pricing",
                "sublinks": []}
        ]};

    $scope.items = items;

    /*
     * Set active item and submenu links
     */
    $scope.hideSubMenu = function () {
        // Move submenu based on position of parent
        $scope.subLeft = {'padding-left': '0px'};

        // Defaults
        $scope.activeItem = null;
        $scope.sublinks = null;
        $scope.isActive = [];
    };
    $scope.hideSubMenu();

    /*
     * Set active item and submenu links
     */
    $scope.showSubMenu = function (item, pos) {
        // Move submenu based on position of parent
        $scope.subLeft = {'padding-left': (80 * pos) + 'px'};

        // Set activeItem and sublinks to the currectly selected item.
        $scope.activeItem = item;
        $scope.sublinks = item.sublinks;
        $scope.isActive = [];
        //$scope.setActive(0);
    };

    //$scope.isActive = [];
    $scope.setActive = function (index) {
        console.log('index ', index);
        $scope.isActive = [];
        $scope.isActive[index] = true;
        console.log('$scope.isActive[index] ', $scope.isActive[index]);
    };

}]);
