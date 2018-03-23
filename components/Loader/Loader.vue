<template>
  <div class="title-canvas">
    <canvas class="home-project__title"></canvas>
    <div class="home-svgs__container container">
      <svg v-for="(project, index) in projects"
            :key="index" 
            class="home-svgs__project-title" 
            width="100%" height="100%" 
            :viewBox="project.svgTitleVB" 
            preserveAspectRatio="xMidYMid meet">
        <path class="project" :d="project.svgTitlePath" />                                
      </svg>
      <svg class="morph-shape" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <path id="shape" style="fill: #000" />             
      </svg>
      <svg class="loading-shape" width="100%" height="100%" viewBox="0 0 1039.64 142.36" preserveAspectRatio="xMidYMid meet">
        <path id="loading" style="fill: #000" d="M.5,4H39.56V110.8h75.89v27.53H.5Z M205.66.5c56.17,0,79.8,30.13,79.8,70.68s-23.62,70.68-79.8,70.68-79.8-30.13-79.8-70.68S149.49.5,205.66.5Zm0,113.83c29.76,0,39.62-19.53,39.62-43.15S235.42,28,205.66,28,166,47.56,166,71.18,175.9,114.33,205.66,114.33Z M345,4h46.69l69.75,134.29H417.7l-12.65-26.6H326.93l-13,26.6H273.73Zm21.58,26L339,86.81h54.13Z M478.89,4h74.59c17.67,0,34.78,2.23,48.36,11.16,16.74,11,27.71,30.32,27.71,54.69,0,23.62-8.74,41.48-21.39,52.27C596.63,132,578,138.33,550.69,138.33h-71.8ZM518,112.29h17.67c31.62,0,53.75-4.84,53.75-41.67,0-31.62-18.41-40.55-47.25-40.55H518Z M650.57,4h39.06V138.33H650.57Z M716.6,4h51.34l61.2,96.72h.37V4h34.6V138.33H812.39L751.56,41.61h-.37v96.72H716.6Z M966,64.49h71.24v71.05c-21.76,3.35-43.71,6.32-65.85,6.32-48.36,0-85.38-18.23-85.38-68.08C886,22.63,919.15.5,968.63.5c33.67,0,69.19,10.42,70.5,46.13H998.95c-.56-14.69-13.58-20.09-30.13-20.09-31.25,0-42.59,19.53-42.59,43.71,0,29.58,16.37,45.57,47.62,45.57a141.34,141.34,0,0,0,27.71-3.35V89.41H966Z"/>             
      </svg>
    </div>
  </div>
</template>

<style lang="scss">
  @import './Loader.scss';
</style>

<script>
import { TweenMax, Power2 } from 'gsap';
import 'gsap/MorphSVGPlugin';
import 'gsap/CustomEase';

  export default {
    props: [
      'projects',
      'viewport',
    ],
    data() {
      return {
        mainCanvas: {
          el: '',
          ctx: '',
          width: '',
          height: '',
        },
        canvasRatio: 0,
        projectsSvg: '',
        svgs: '',
        shape: '',
        endShape: '',
        toBezier: '',
        responsiveRatio: '',
        svgWidth: '',
        svgHeight: '',
        states: [],
        sizes: [],
        titleIndex: this.$store.state.activeIndex,
        maxRatio: 0,
        tick: 0,
        resizeTimer: undefined,
        req: undefined,
        verticalIncrement: '',
        incrementDirection: '',
        morphingSVG: {
          el: '',
          width: '',
          height: '',
          x: '',
          y:  '',
          visibleHeight: '',
          visibleWidth: '',
          visibleX: '',
          visibleY: '',
        },
        mouse: {
          posX: undefined,
          posY: undefined,
        },
        title: {
          minX: undefined,
          maxX: undefined,
          minY: undefined,
          maxY: undefined,
          isHovered: false,
          hasBeenHovered: false,
          alpha: 0.7,
        },
        loadingAnimation: {
          isComplete: false,
          hasStarted: false,
          duplications: 0,
          duplicatesIncrement: 0,
          totalDuplications: 0,
        },
        tl: new TimelineMax(),
      }
    },
    components: {
    },
    created() {},
    mounted() {
      this.init();      
    },
    beforeDestroy() {
      this.cancelEventListeners();
      cancelAnimationFrame(this.req);
    },
    methods: {
      init() {
        // initialize canvas
        this.mainCanvas.el = document.querySelector('.home-project__title')
        this.mainCanvas.ctx = this.mainCanvas.el.getContext('2d');
        this.mainCanvas.width = this.viewport.w;
        this.mainCanvas.height = this.viewport.h;
        this.verticalIncrement = this.viewport.h / 30;
        this.incrementDirection = this.position === 'header' ? -1 : 1;
        this.projectsSvg = document.querySelectorAll('.home-svgs__project-title');
        this.svgs = document.querySelectorAll('svg');
        this.shape = document.querySelector("#shape")
        this.endShape = document.querySelectorAll(".project");
        this.responsiveRatio = this.defineResponsiveRatio();
        this.toBezier = MorphSVGPlugin.pathDataToRawBezier;
        this.morphingSVG.el = document.querySelector('.morph-shape');
        this.shape.setAttribute('d', document.querySelector('#loading').getAttribute('d'));
        this.morphingSVG.el.setAttribute('viewBox', document.querySelector('.loading-shape').getAttribute('viewBox'));
        this.updateMorphingValues();
        // Subscribe to state project update
        this.subscribeToStoreEvents();
        this.setEventListeners();
        this.setDisplay();
        setTimeout(() => {
          this.startDuplications();
          this.render();
        }, 1000);
      },

      calculateMaxDuplications() {
        return Math.trunc(Math.ceil((this.mainCanvas.el.height + this.morphingSVG.visibleHeight + this.morphingSVG.visibleY) / this.verticalIncrement)) + 5;
      },

      subscribeToStoreEvents() {
        let suscribe = this.$store.subscribe((mutation, state) => {
          if (mutation.type === 'SET_ACTIVEINDEX') {
            this.maxLength = 0;
            this.tick = 0;
            this.states.length = 0;
            this.sizes.length = 0;
            this.titleAnimation.isComplete = false;
            this.titleIndex =  this.$store.state.activeIndex;
            this.morphTitle();
          }
        })
      },
      setEventListeners() {
        window.addEventListener('resize', this.resize)
      },

      onUpdate() {
        // get the state of the morphed svg
        const data = this.shape.getAttribute("d");
        const fill = this.shape.style.fill;
        this.updateMorphingValues();

        // get width and height of morphed svg
        this.svgWidth = document.querySelector('#shape').getBoundingClientRect().width
        this.svgHeight = Math.floor(document.querySelector('#shape').getBoundingClientRect().height);
        this.mainCanvas.ctx.clearRect(0, 0 - this.canvasRatio * this.verticalIncrement, this.mainCanvas.el.width, this.mainCanvas.el.height);

        if (this.loadingAnimation.isComplete === false) {
          this.drawLoadingAnimation(data);
        }

        if (this.loadingAnimation.isComplete === true) {
          this.removeLoadingAnimation(data);
        }
      },

      /* 
      * Draw the project title when no animation is going on
      */
      drawLoadingAnimation(data) {
        const duplicates = Math.trunc(Math.ceil(this.loadingAnimation.duplications));
        if (this.sizes.length === 0) {
          for (let i = 0; i < this.loadingAnimation.totalDuplications; i++){
            this.states[i] = this.toBezier(data);
            this.sizes[i] = ((this.mainCanvas.el.width / 2) - this.svgWidth / (this.mainCanvas.el.width / (this.morphingSVG.visibleWidth)) / 2 - this.morphingSVG.visibleX);
          }
        }
        for (let j = 0; j < duplicates; j++) {
          const ratioX = this.sizes[j];
          let ratioY = this.mainCanvas.el.height - this.verticalIncrement * j;
          this.title.minY = this.ratioY + (this.canvasRatio * this.verticalIncrement);
          this.title.maxY = this.title.minY + this.morphingSVG.visibleHeight;
          if (ratioY <= this.canvasRatio * this.verticalIncrement - (this.title.maxY - this.title.minY) / 2) {
            ratioY = this.canvasRatio * this.verticalIncrement - (this.title.maxY - this.title.minY) / 2 
          }
          this.mainCanvas.ctx.beginPath();
          this.mainCanvas.ctx.strokeWidth = 2;
          this.drawSvg(this.states[j], ratioX, ratioY);
          
          const fillStroke = (this.loadingAnimation.totalDuplications - j) / this.loadingAnimation.totalDuplications;
          this.strokeFillClosePath(fillStroke);
          if(duplicates === this.loadingAnimation.totalDuplications && j === duplicates - 1){
            this.startRemovingDuplications(this.tick);
            return;
          }
        }
        this.tick ++;
      },

      removeLoadingAnimation(data) {
        const duplicates = Math.trunc(Math.ceil(this.loadingAnimation.duplications));
        if (this.sizes.length === 0) {
          for (let i = 0; i < this.loadingAnimation.totalDuplications; i++){
            this.states[i] = this.toBezier(data);
            this.sizes[i] = ((this.mainCanvas.el.width / 2) - this.svgWidth / (this.mainCanvas.el.width / (this.morphingSVG.visibleWidth)) / 2 - this.morphingSVG.visibleX);
          }
        }
        for (let j = 0; j < duplicates; j++) {
          const ratioX = this.sizes[j];
          let ratioY = this.mainCanvas.el.height - this.verticalIncrement * (this.loadingAnimation.totalDuplications - j);
          this.title.minY = this.ratioY + (this.canvasRatio * this.verticalIncrement);
          this.title.maxY = this.title.minY + this.morphingSVG.visibleHeight;
          if (ratioY <= this.canvasRatio * this.verticalIncrement - (this.title.maxY - this.title.minY) / 2) {
            ratioY = this.canvasRatio * this.verticalIncrement - (this.title.maxY - this.title.minY) / 2 
          }
          this.mainCanvas.ctx.beginPath();
          this.mainCanvas.ctx.strokeWidth = 2;
          this.drawSvg(this.states[j], ratioX, ratioY);
            
          const fillStroke = j / this.loadingAnimation.totalDuplications;
          this.strokeFillClosePath(fillStroke);
          if(duplicates === 1 && j === duplicates - 1){
            this.startDuplications();
            return;
          }
        }
        this.tick --;
      },

     /* 
      * Draw the first part of the project switch animation
      * morph the hidden svg into the next title, and create duplications 
      * following the bezier curve.
      */
      projectTransitionStart(data) {
        const duplicates = Math.trunc(Math.ceil(this.loadingAnimation.duplications));
        if (this.loadingAnimation.duplicatesIncrement === 0){
          this.canvasRatio--;
          this.mainCanvas.ctx.translate(0, -this.verticalIncrement);
        }
        this.canvasRatio++;
        this.mainCanvas.ctx.translate(0, (duplicates - this.loadingAnimation.duplicatesIncrement) * this.verticalIncrement);
        this.loadingAnimation.duplicatesIncrement = duplicates;
        for (let i = this.states.length; i < duplicates; i++ ){
          this.states[i] = (this.toBezier(data));
          this.sizes[i] = ((this.mainCanvas.el.width / 2) - this.svgWidth / (this.mainCanvas.el.width / this.morphingSVG.visibleWidth) / 2 - this.morphingSVG.visibleX)
        }
        for (let j = 0; j < duplicates; j++ ) {
          const ratioX = this.sizes[j];
          const ratioY = this.mainCanvas.el.height / 2 - (this.morphingSVG.visibleHeight / 2) - ((this.maxRatio + j) * this.verticalIncrement) - this.morphingSVG.visibleY;
          this.mainCanvas.ctx.beginPath();
          this.mainCanvas.ctx.strokeWidth = 2;
          if (this.states[j] === undefined){
            this.states[j] = this.states[j - 1];
          }
          this.drawSvg(this.states[j], ratioX, ratioY);
          this.mainCanvas.ctx.fillStyle = "transparent";
          // calculate alpha of duplicata
          const fillStroke = j / duplicates > 0.5 ? (j + 1) * 0.7 / duplicates : 0;
          this.strokeFillClosePath(fillStroke);
          if (duplicates === this.loadingAnimation.totalDuplications && j === duplicates - 1) {            
            this.easeSlideProjectAnimation(duplicates);
            return;
          }
        }
        this.tick++;
      },

      

      morphTitle() {
        // this.titleAnimation.totalDuplications = 70;
        this.tl.to(this.shape, 0.7,
          {
            morphSVG: this.endShape[this.titleIndex], 
            ease: Power2.easeOut,
            strokeWidth: 2,
          },
          ).to(this.morphingSVG.el, 0.7, 
          {
            attr: { viewBox: this.svgs[this.titleIndex].getAttribute('viewBox')},
            ease: Power2.easeOut,

          }, '-=1')
          .to(this.loadingAnimationloadingAnimation, 1, {
            duplications: this.loadingAnimationloadingAnimation.totalDuplications,
            ease: CustomEase.create('custom", "0.77, 0, 0.175, 1')
          }, '-=1');
      },

      /* 
      * Draw path of svg from  Bezier points
      * params(points: array) the points to draws
      */
      drawSvg(points, ratioX, ratioY) {
        points.forEach(p => {
          this.mainCanvas.ctx.moveTo(p[0] * this.responsiveRatio + ratioX, p[1] * this.responsiveRatio + ratioY);
          for (let i = 2, len = p.length; i <= len;) {
            this.mainCanvas.ctx.bezierCurveTo(
              p[i++] * this.responsiveRatio + ratioX, 
              p[i++] * this.responsiveRatio + ratioY, 
              p[i++] * this.responsiveRatio + ratioX, 
              p[i++] * this.responsiveRatio + ratioY, 
              p[i++] * this.responsiveRatio + ratioX, 
              p[i++] * this.responsiveRatio + ratioY
            );
          }
        });
      },

      /* 
      * Close paths of svgs
      */
      strokeFillClosePath(strokeAlpha) {
        this.mainCanvas.ctx.fillStyle = "transparent";
        this.mainCanvas.ctx.strokeStyle = `rgba(255,255,255,${ strokeAlpha })`;
        this.mainCanvas.ctx.stroke();
        this.mainCanvas.ctx.fill();
        this.mainCanvas.ctx.closePath();
      },

      updateMorphingValues() {
        this.morphingSVG.width = this.morphingSVG.el.viewBox.baseVal.width;
        this.morphingSVG.height = this.morphingSVG.el.viewBox.baseVal.height;
        this.morphingSVG.x = this.morphingSVG.el.viewBox.baseVal.x;
        this.morphingSVG.y = this.morphingSVG.el.viewBox.baseVal.y;
        this.morphingSVG.visibleHeight = this.morphingSVG.height * this.responsiveRatio;
        this.morphingSVG.visibleWidth = this.morphingSVG.width * this.responsiveRatio;
        this.morphingSVG.visibleX = this.morphingSVG.x * this.responsiveRatio;
        this.morphingSVG.visibleY = this.morphingSVG.y * this.responsiveRatio;
      },

      startDuplications() {
        this.loadingAnimation.isComplete = false;
        this.loadingAnimation.duplications = 0;
        this.loadingAnimation.totalDuplications = this.calculateMaxDuplications();
        TweenMax.to(this.loadingAnimation, 1.2,
        {
          duplications: this.loadingAnimation.totalDuplications,
          ease: Power2.easeOut,
        });
      },

      startRemovingDuplications() {
        this.loadingAnimation.isComplete = true;
        TweenMax.to(this.loadingAnimation, 0.8,
        {
          duplications: 1,
          ease: Power2.easeIn,
        });
      },

      routeToProject() {
        this.$router.push('about');
      },
      defineResponsiveRatio() {
        const largestSvg = Object.keys(this.projectsSvg).reduce((a, b) => this.projectsSvg[a].viewBox.baseVal.width > this.projectsSvg[b].viewBox.baseVal.width ? a : b);
        return this.viewport.w * 0.8 < this.projectsSvg[largestSvg].viewBox.baseVal.width ? this.viewport.w * 0.8 / this.projectsSvg[largestSvg].viewBox.baseVal.width : 1;
      },

      setDisplay() {
        const ratio = 1;
        this.mainCanvas.el.width  = this.viewport.w * ratio;
        this.mainCanvas.el.height = this.viewport.h * ratio;
        this.mainCanvas.ctx.scale(ratio, ratio);
      },

      /* 
      * The main animation
      */
      render() {
        this.mainCanvas.ctx.clearRect(0, 0, this.mainCanvas.el.width, this.mainCanvas.el.height);
        this.onUpdate();
        this.req = requestAnimationFrame(this.render);
      },

      resize() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() =>  {
          // Run code here, resizing has "stopped"
          this.viewport.w = window.innerWidth
          this.viewport.h = window.innerHeight
          this.mainCanvas.width = window.innerWidth;
          this.mainCanvas.height = window.innerHeight;
          this.mainCanvas.el.height = this.viewport.h;
          this.mainCanvas.el.width = this.viewport.w;
          this.verticalIncrement = this.viewport.h / 220;
          this.responsiveRatio = this.defineResponsiveRatio();
          this.mainCanvas.width = window.innerWidth;
          this.mainCanvas.height = window.innerHeight;
          this.mainCanvas.el.height = this.viewport.h;
          this.mainCanvas.el.width = this.viewport.w;

          // this.checkMobileLayout();
          //this.mainCanvas.setWidth();
          // const indexSvgY = svgs[4].viewBox.baseVal.y;
          // const indexSvgHeight = svgs[4].viewBox.baseVal.height;
          this.mainCanvas.ctx.setTransform(1,0,0,1,0,0);
          this.updateMorphingValues();
          this.mainCanvas.ctx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);    
          // this.mainCanvas.ctx.translate(0, this.pageTransition.totalDuplications * (this.incrementDirection * this.verticalIncrement));
          // mainCanvas.ctx.setTransform(1,0,0,1,0, -canvasRatio * verticalIncrement);
        }, 100);
      },

      cancelEventListeners() {
        document.removeEventListener('click', this.clickEvent);
      }
    }
}
</script>
