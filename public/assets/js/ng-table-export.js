
angular.module("ngTableExport",[]).config(["$compileProvider",function(a){a.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/)}]).directive("exportCsv",["$parse","$timeout",function(a,b){var c="	",d="data:text/csv;charset=UTF-8,";return{restrict:"A",scope:!1,link:function(e,f,g){function h(a){return'"'+a.replace(/^\s\s*/,"").replace(/\s*\s$/,"").replace(/"/g,'""')+'"'}function i(){k="";var a=f.find("tr");angular.forEach(a,function(a,b){var d=angular.element(a),e=d.find("th"),f="";d.hasClass("ng-table-filters")||(0===e.length&&(e=d.find("td")),1!==b&&(angular.forEach(e,function(a){f+=h(angular.element(a).text())+Array.apply(null,Array(a.colSpan)).map(function(){return c}).join("")}),f=f.slice(0,f.length-1)),k+=f+"\n")}),k=""+c+"\n"+k}function j(a,c){var d=document.createElement("a");d.style.display="none",d.href=a,d.download=c,d.target="_blank",b(function(){document.body.appendChild(d),d.click(),document.body.removeChild(d)},0,!1)}var k="";g.delimiter&&(c=g.delimiter);var l={generate:function(a,c,f){var h=g.ngTable,f=f||e.$parent.tableParams,l=f?f.settings():{},m=f?f.count():{},n=f?l.total:{};if(h&&n>m){var o=l.$scope.$on("ngTableAfterReloadData",function(){o(),b(function(){i(),f.count(m),f.reload(),j(d+encodeURIComponent(k),c)},1e3,!1)});f.count(1/0),f.reload()}else i(),j(d+encodeURIComponent(k),c)}};a(g.exportCsv).assign(e.$parent,l)}}}]);
