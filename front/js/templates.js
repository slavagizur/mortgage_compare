(function () {
    function Templates() {
        this.loadPath = "templates/";
    }

    Templates.prototype.load = function (templates, suffix, callback) {
        var allTemplates = templates, templateResult = [];
        if (allTemplates.length === 0) {
            return;
        }
        this._loadTemplate(allTemplates, suffix, 0, templateResult, callback);
    };

    Templates.prototype._loadTemplate = function (templates, suffix, templateNo, templateResult, callback) {
        if (templateNo >= templates.length) {
            callback(templateResult);
        }
        else {
            var self = this;
            $.get(this.loadPath + templates[templateNo] + suffix + ".html", function (result) {
                templateResult.push(result);
                templateNo++;
                self._loadTemplate(templates, suffix, templateNo, templateResult, callback);
            });
        }
    };

    ru.gizur.apps.templates = new Templates();
}());