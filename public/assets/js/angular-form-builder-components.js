(function () {
    angular.module('builder.components', ['builder', 'validator.rules']).config([
        '$builderProvider', function ($builderProvider) {

            /****************************** Common Answers ************************************/

            $builderProvider.registerComponent('welcomeNote', {
                elementTpl: '<i class="fa fa-sticky-note actionBtn"></i> Agent Note',
                group: 'Common Questions',
                label: 'Agent Note',
                description: 'Type Some Note For Your Agent Here',
                templateUrl: "/views/elements/formBuilderTpls/welcomeNoteTemplate.html",
                popoverTemplateUrl: "/views/elements/formBuilderTpls/welcomeNoteTemplate_popover.html"
            });

            $builderProvider.registerComponent('name', {
                elementTpl: '<i class="fa fa-user actionBtn"></i> Full Name',
                group: 'Common Questions',
                label: 'Full Name',
                required: false,
                arrayToText: true,
                templateUrl: "/views/elements/formBuilderTpls/nameTemplate.html",
                popoverTemplateUrl: "/views/elements/formBuilderTpls/nameTemplate_popover.html",
                firstNameLabel: 'First Name',
                lastNameLabel: 'Last Name'
            });
            $builderProvider.registerComponent('phoneNumber', {
                elementTpl: '<i class="fa fa-phone actionBtn"></i> Phone Number',
                group: 'Common Questions',
                label: 'Phone Number',
                description: 'Please verify the number by repeating it back to the caller',
                placeholder: 'Phone Number',
                required: false,
                validationOptions: [
                    {
                        label: 'none',
                        rule: '/.*/'
                    }, {
                        label: 'number',
                        rule: '[number]'
                    }
                ],
                templateUrl: '/views/elements/formBuilderTpls/phoneTemplate.html',
                popoverTemplateUrl: '/views/elements/formBuilderTpls/popoverTemplate.html'
            });
            $builderProvider.registerComponent('email', {
                elementTpl: '<i class="fa fa-at actionBtn"></i> Email',
                group: 'Common Questions',
                label: 'Email',
                description: 'Please verify the email by repeating it back to the caller',
                placeholder: 'Email Address',
                required: false,
                validationOptions: [
                    {
                        label: 'none',
                        rule: '/.*/'
                    }, {
                        label: 'email',
                        rule: '[email]'
                    }
                ],
                templateUrl: '/views/elements/formBuilderTpls/emailTemplate.html',
                popoverTemplateUrl: '/views/elements/formBuilderTpls/popoverTemplate.html'
            });
//            $builderProvider.registerComponent('company', {
//                elementTpl: '<i class="fa fa-random actionBtn"></i> Company',
//                group: 'Common Questions',
//                label: 'Sample',
//                description: 'From html template',
//                placeholder: 'placeholder',
//                required: false,
//                validationOptions: [
//                    {
//                        label: 'none',
//                        rule: '/.*/'
//                    }, {
//                        label: 'number',
//                        rule: '[number]'
//                    }, {
//                        label: 'email',
//                        rule: '[email]'
//                    }, {
//                        label: 'url',
//                        rule: '[url]'
//                    }
//                ],
//                templateUrl: 'views/elements/formBuilderTpls/template.html',
//                popoverTemplateUrl: 'views/elements/formBuilderTpls/popoverTemplate.html'
//            });
            $builderProvider.registerComponent('message', {
                elementTpl: '<i class="fa fa-envelope actionBtn"></i> Message',
                group: 'Common Questions',
                label: 'Message',
                description: '',
                placeholder: '',
                required: false,
                templateUrl: '/views/elements/formBuilderTpls/msgTemplate.html',
                popoverTemplateUrl: '/views/elements/formBuilderTpls/msgTemplate_popover.html'
            });
            $builderProvider.registerComponent('address', {
                elementTpl: '<i class="fa fa-home actionBtn"></i> Address',
                group: 'Common Questions',
                label: 'Address',
                description: 'Caller Address',
                placeholder: 'placeholder',
                required: false,
                arrayToText: true,
                validationOptions: [
                    {
                        label: 'none',
                        rule: '/.*/'
                    }, {
                        label: 'number',
                        rule: '[number]'
                    }, {
                        label: 'email',
                        rule: '[email]'
                    }, {
                        label: 'url',
                        rule: '[url]'
                    }
                ],
                templateUrl: '/views/elements/formBuilderTpls/addressTemplate.html',
                popoverTemplateUrl: '/views/elements/formBuilderTpls/addressTemplate_popover.html',
                addressOneLabel: 'Address Line 1',
                addressTwoLabel: 'Address 2 (suite or apartment)',
                cityLabel: 'City',
                stateLabel: 'State',
                zipCodeLabel: 'Zip Code'
            });

            /****************************** Schedular ************************************/
//            $builderProvider.registerComponent('datePicker', {
//                elementTpl: '<i class="fa fa-calendar actionBtn"></i> Calendar',
//                group: 'Schedulars',
//                label: 'Calendar',
//                description: 'click to pick a date',
//                placeholder: 'Click here',
//                required: false,
//                validationOptions: [
//                    {
//                        label: 'none',
//                        rule: '/.*/'
//                    }
//                ],
//                templateUrl: 'views/elements/formBuilderTpls/datePickerTemplate.html',
//                popoverTemplateUrl: 'views/elements/formBuilderTpls/datePickerTemplate_popover.html'
//            });


            /****************************** Custom Answers ************************************/
            $builderProvider.registerComponent('textInput', {
                elementTpl: '<i class="fa fa-text-width actionBtn"></i>Single Line Answer',
                group: 'Custom Questions', //group: 'Default',
                label: 'Text Input',
                description: 'description',
                placeholder: 'placeholder',
                required: false,
                validationOptions: [
                    {
                        label: 'none',
                        rule: '/.*/'
                    }, {
                        label: 'number',
                        rule: '[number]'
                    }, {
                        label: 'email',
                        rule: '[email]'
                    }, {
                        label: 'url',
                        rule: '[url]'
                    }
                ],
                templateUrl: "/views/elements/formBuilderTpls/txtInputTemplate.html",
                popoverTemplateUrl: "/views/elements/formBuilderTpls/txtInputTemplate_popover.html"
            });
            $builderProvider.registerComponent('textArea', {
                elementTpl: '<i class="fa fa-paragraph actionBtn"></i> Multiple Line Answer',
                group: 'Custom Questions', //group: 'Default',
                label: 'Text Area',
                description: 'description',
                placeholder: 'placeholder',
                required: false,
                templateUrl: "/views/elements/formBuilderTpls/txtAreaTemplate.html",
                popoverTemplateUrl: "/views/elements/formBuilderTpls/txtAreaTemplate_popover.html"
            });
            $builderProvider.registerComponent('checkbox', {
                elementTpl: '<i class="fa fa-check-square-o actionBtn"></i> Multiple Choices Answer',
                group: 'Custom Questions', //group: 'Default',
                label: 'Checkbox',
                description: 'description',
                placeholder: 'placeholder',
                required: false,
                options: ['value one', 'value two'],
                arrayToText: true,
                templateUrl: "/views/elements/formBuilderTpls/chkBoxTemplate.html",
                popoverTemplateUrl: "/views/elements/formBuilderTpls/chkBoxTemplate_popover.html"
            });
            $builderProvider.registerComponent('radio', {
                elementTpl: '<i class="fa fa-dot-circle-o actionBtn"></i> Single Choice Answer',
                group: 'Custom Questions', //group: 'Default',
                label: 'Radio',
                description: 'description',
                placeholder: 'placeholder',
                required: false,
                options: ['value one', 'value two'],
                templateUrl: "/views/elements/formBuilderTpls/radioBtnTemplate.html",
                popoverTemplateUrl: "/views/elements/formBuilderTpls/radioBtnTemplate_popover.html"
            });
            return $builderProvider.registerComponent('select', {
                elementTpl: '<i class="fa fa-sign-out fa-rotate-90 actionBtn"></i> Dropdown Answer',
                group: 'Custom Questions', //group: 'Default',
                label: 'Select',
                description: 'description',
                placeholder: 'placeholder',
                required: false,
                options: ['value one', 'value two'],
                templateUrl: "/views/elements/formBuilderTpls/dropDownTemplate.html",
                popoverTemplateUrl: "/views/elements/formBuilderTpls/dropDownTemplate_popover.html"
            });
        }
    ]);

}).call(this);
