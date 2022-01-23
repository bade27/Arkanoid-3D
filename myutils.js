var myutils = {
  normalize3Vector:function(v) {
    var magnitude = Math.pow(Math.pow(v[0], 2)+Math.pow(v[1], 2)+Math.pow(v[2], 2), 0.5);
    return [v[0]/magnitude,v[1]/magnitude,v[2]/magnitude];
  },

  crossProduct:function(u, v) {
    return [
      u[1]*v[2]-u[2]*v[1],
      u[0]*v[2]-u[2]*v[0],
      u[0]*v[1]-u[1]*v[0]
    ];
  },

  vectorDiff: function (u, v) {
    return [u[0]-v[0], u[1]-v[1], u[2]-v[2]]
  },

  round2dec: function (num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }
}
