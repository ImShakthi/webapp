var BaseHandlerUtil = {
  init: function() {

  },
  onClick: function() {
    d3.selectAll("p").style("color", "#" + BaseHandlerUtil.getRandomColor());
  },
  getRandomColor: function() {
    var colorCode = "";
    for (var index = 0; index < 6; index++) {
      rand = Math.floor(Math.random() * 10);
      colorCode = rand + colorCode;
    }
    return colorCode;
  }
};

BaseHandlerUtil.init();
