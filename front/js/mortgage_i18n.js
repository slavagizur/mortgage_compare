(function() {
    function Translater() {
        this.ru = {};
    }

    Translater.prototype.addTranslation = function(key, language, translation) {
        this[language][key] = translation;
    };

    Translater.prototype.getTranslation = function(key, language) {
        var finalText = key;
        if (typeof this[language] !== 'undefined' && typeof this[language][key] !== 'undefined') {
            finalText = this[language][key];
        }
        return finalText;
    };

    ru.gizur.apps.translater = new Translater();

    ru.gizur.apps.translater.addTranslation("Version", "ru", "Версия");
}());
