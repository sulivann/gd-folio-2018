<template>
  <canvas
    id="about-face"
    :width="`${this.canvas.width}px`"
    :height="`${this.canvas.height}px`">
  </canvas>
</template>

<style lang="scss">
  @import './AboutFace.scss';
</style>

<script>
  import faceSrc from 'assets/img/face.png';

  export default {
    data() {
      return {
        canvas: {
          height: 1000,
          width: 333
        },
        deltaY: 0
      }
    },
    mounted() {
      this.bind();
      this.initCanvas();
      this.render();
    },
    methods: {
      bind() {
        this.ctx = document.getElementById('about-face').getContext('2d');
      },
      initCanvas() {
        this.faceImg = new Image();
        this.faceImg.onload = (e) => {
          this.ctx.drawImage(this.faceImg, 0, this.canvas.height - this.faceImg.height);
          this.handleEventListeners();
        };
        this.faceImg.src = faceSrc;
      },
      handleEventListeners() {
        if (window.addEventListener) {
          window.addEventListener('DOMMouseScroll', this.wheelTriggeredFunction, false);
          window.addEventListener('mousewheel', this.wheelTriggeredFunction, false);
        } else {
          window.addEventListener('wheel', this.wheelTriggeredFunction);
        }
      },
      wheelTriggeredFunction(e) {
        this.deltaY = Math.abs(e.deltaY);
      },
      duplicateFace() {
        for (let i = 0; i <= (this.deltaY/2); i++) {
          this.ctx.drawImage(this.faceImg, 0, (this.canvas.height - this.faceImg.height)-i*2);
        }
      },
      render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.duplicateFace();
        requestAnimationFrame(this.render);
      }
    },

  }
</script>
