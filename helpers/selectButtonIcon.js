module.exports = function() {
    if (this.isSelected === true) {
        return 'fa fa-times';
    }

    return 'fa fa-plus'
};