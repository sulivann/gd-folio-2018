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
        </div>

    </div>
</template>

<style lang="scss">
  @import './TitleCanvas.scss';
</style>

<script>
import { TweenMax, Power2 } from 'gsap';
import 'gsap/MorphSVGPlugin';
import 'gsap/CustomEase';

  export default {
    props: [
      'projects',
      'viewport',
      'position'
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
        pageTransition: {
          isComplete: undefined,
          hasStarted: false,
          duplications: 0,
          duplicatesIncrement: 0,
          totalDuplications: 0,
        },
        backHomeTransition: {
          isComplete: undefined,
          hasStarted: false,
          duplications: 0,
          duplicatesIncrement: 0,
          totalDuplications: 0,
        },
        titleAnimation: {
          isComplete: undefined,
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
    created() {
      this.$parent.$on('mousemove', this.checkTitleHover);
    },
    mounted() {
      this.init();      
    },
    beforeDestroy() {
      this.cancelEventListeners();
      cancelAnimationFrame(this.req);
    },
    methods: {
      init() {
        console.log(this.title.alpha)
        // initialize canvas
        this.mainCanvas.el = document.querySelector('.home-project__title')
        this.mainCanvas.ctx = this.mainCanvas.el.getContext('2d');
        this.mainCanvas.width = this.viewport.w;
        this.mainCanvas.height = this.viewport.h;
        this.verticalIncrement = this.viewport.h / 220;
        this.incrementDirection = this.position === 'header' ? -1 : 1;
        this.projectsSvg = document.querySelectorAll('.home-svgs__project-title');
        this.svgs = document.querySelectorAll('svg');
        this.shape = document.querySelector("#shape")
        this.endShape = document.querySelectorAll(".project");
        this.responsiveRatio = this.defineResponsiveRatio();
        this.toBezier = MorphSVGPlugin.pathDataToRawBezier;
        this.morphingSVG.el = document.querySelector('.morph-shape');
        this.shape.setAttribute('d', this.projects[this.$store.state.activeIndex].svgTitlePath);
        this.morphingSVG.el.setAttribute('viewBox', this.projects[this.$store.state.activeIndex].svgTitleVB);
        this.updateMorphingValues();
        // Subscribe to state project update
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
        this.setEventListeners();
        this.setDisplay();
        this.render();
        if (this.position === 'header') {
          this.pageTransition.totalDuplications = Math.trunc((this.mainCanvas.el.height / 2 - (this.morphingSVG.visibleHeight / 2 * 0.30) - ((this.maxRatio + 1) * this.verticalIncrement) - this.morphingSVG.visibleY) / (this.verticalIncrement));
          this.mainCanvas.ctx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
          this.mainCanvas.ctx.translate(0, -this.verticalIncrement*this.pageTransition.totalDuplications);
        }
        if (this.position === 'footer') {
          this.pageTransition.totalDuplications = Math.trunc((this.mainCanvas.el.height / 2 - (this.morphingSVG.visibleHeight / 2 * 0.30) - ((this.maxRatio + 1) * this.verticalIncrement) - this.morphingSVG.visibleY) / (this.verticalIncrement));
          this.mainCanvas.ctx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);    
          this.mainCanvas.ctx.translate(0, this.verticalIncrement*this.pageTransition.totalDuplications);
        }
      },

      setEventListeners() {
        document.addEventListener('click', this.clickEvent);
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

        // first part of the title animation on click
        if (this.pageTransition.isComplete === false) {
          this.pageTransitionStart(data);
          return
        }
        //  second part of the title animation on click (remove the duplicates)
        if (this.pageTransition.isComplete === true) {
          this.pageTransitionEnd(data);
          return
        }

        // if title animates back to home
        if (this.backHomeTransition.isComplete === false) {
          this.pageBackHomeTransitionStart(data);
        }

        // if title animates back to home
        if (this.backHomeTransition.isComplete === true) {
          this.pageBackHomeTransitionEnd(data);
        }

        // If the title is not animating
        if ((this.titleAnimation.isComplete === undefined && 
             this.pageTransition.isComplete !== false && 
             this.backHomeTransition.isComplete === undefined) || 
            (this.title.pageTransition === undefined && 
             this.titleAnimation.isComplete === undefined && 
             this.backHomeTransition.isComplete === undefined)) {
          this.drawStaticTitle(data);
          return;
        }
        // if title animation is on 
        if (this.titleAnimation.isComplete === false) {
          this.projectTransitionStart(data);
          return
        } 
        //  animation is finished, we remove the duplications        
        if (this.titleAnimation.isComplete === true) {   
          this.projectTransitionEnd(data);
          return
        }
      },

      /* 
      * Draw the project title when no animation is going on
      */
      drawStaticTitle() {
        const data = this.shape.getAttribute("d");
        this.svgWidth = document.querySelector('#shape').getBoundingClientRect().width
        this.svgHeight = Math.floor(document.querySelector('#shape').getBoundingClientRect().height);
        const ratioX = ((this.mainCanvas.el.width / 2) - (this.svgWidth / (this.mainCanvas.el.width / this.morphingSVG.visibleWidth) / 2) - this.morphingSVG.visibleX);
        const ratioY = this.mainCanvas.el.height / 2 - (this.morphingSVG.visibleHeight / 2) - ((this.maxRatio + this.pageTransition.totalDuplications - 1) + this.sizes.length - this.pageTransition.totalDuplications + 1) * this.verticalIncrement - this.morphingSVG.visibleY;
        // define box position of the title for the hover
        this.title.minX = ratioX;
        this.title.maxX = this.title.minX + this.morphingSVG.visibleWidth;
        this.title.minY = ratioY + (this.canvasRatio * this.verticalIncrement);
        this.title.maxY = this.title.minY + this.morphingSVG.visibleHeight;
        this.mainCanvas.ctx.beginPath();
        this.mainCanvas.ctx.strokeWidth = 2;
        const bezierpoints = this.toBezier(data);
        this.drawSvg(bezierpoints, ratioX, ratioY);
        this.strokeFillClosePath(this.title.alpha);
      },

      /* 
      * Draw the first part of the project switch animation
      * morph the hidden svg into the next title, and create duplications 
      * following the bezier curve.
      */
      projectTransitionStart(data) {
          const duplicates = Math.trunc(Math.ceil(this.titleAnimation.duplications));
          if (this.titleAnimation.duplicatesIncrement === 0){
              this.canvasRatio--;
              this.mainCanvas.ctx.translate(0, -this.verticalIncrement);
          }
          this.canvasRatio++;
          this.mainCanvas.ctx.translate(0, (duplicates - this.titleAnimation.duplicatesIncrement) * this.verticalIncrement);
          this.titleAnimation.duplicatesIncrement = duplicates;
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
              if (duplicates === this.titleAnimation.totalDuplications && j === duplicates - 1) {            
                  this.easeSlideProjectAnimation(duplicates);
                  return;
              }
          }
          this.tick++;
      },

      /* 
      * Draw the second part of the project switch transition
      * Remove the duplications until there's only one left
      */
      projectTransitionEnd(data) {
          const duplicates = Math.trunc(Math.ceil(this.titleAnimation.duplications));   
          if (this.maxLength === 0) {
              this.maxLength = this.titleAnimation.totalDuplications - 1;
              this.canvasRatio = duplicates - 1;
          }
          this.canvasRatio--;
          this.mainCanvas.ctx.translate(0, (this.titleAnimation.duplicatesIncrement - duplicates) * -this.verticalIncrement);
          this.titleAnimation.duplicatesIncrement = duplicates;
          for (let j = 0; j < duplicates; j++ ) {
            const ratioX = this.sizes[j + this.sizes.length - duplicates];
            const ratioY = this.mainCanvas.el.height / 2 - (this.morphingSVG.visibleHeight / 2) - ((this.maxRatio + j) * this.verticalIncrement) - this.morphingSVG.visibleY;;
            this.mainCanvas.ctx.beginPath();
            this.mainCanvas.ctx.strokeWidth = 2;
            this.drawSvg(this.states[j + this.titleAnimation.totalDuplications - duplicates], ratioX, ratioY);
            this.mainCanvas.ctx.fillStyle = "transparent";
            let fillStroke = j / duplicates > 0.5 ? (j + 1 ) * 0.7 / duplicates : 0;
            if (j === duplicates - 1) {
              fillStroke = 0.7;
            }
            this.strokeFillClosePath(fillStroke);
            if (duplicates === 1){
              this.canvasRatio = 0;
              this.sizes.length = 0;
              this.titleAnimation.isComplete = undefined;
              return;           
            }
          }
          this.displayedDuplicatas--;
          this.tick--;
      },

      /* 
      * Draw the first part of the page transition animation
      * The title duplicates following the Bezier curve incrementation of the number x
      * 
      */
      pageTransitionStart(data) {
        const duplicates = Math.trunc(Math.ceil(this.pageTransition.duplications));
        if (duplicates === 0) {
          for (let i = 0; i < this.pageTransition.totalDuplications; i++){
            this.states[i] = this.toBezier(data);
            this.sizes[i] = ((this.mainCanvas.el.width / 2) - this.svgWidth / (this.mainCanvas.el.width / (this.morphingSVG.visibleWidth)) / 2 - this.morphingSVG.visibleX);
          }
        }
        for (let j = 0; j <= duplicates; j++) {
          const ratioX = this.sizes[j];
          let ratioY = this.mainCanvas.el.height / 2 - (this.morphingSVG.visibleHeight / 2) - ((this.maxRatio + j + 1) * this.verticalIncrement) - this.morphingSVG.visibleY;
          this.title.minY = this.ratioY + (this.canvasRatio * this.verticalIncrement);
          this.title.maxY = this.title.minY + this.morphingSVG.visibleHeight;
          if (ratioY <= this.canvasRatio * this.verticalIncrement - (this.title.maxY - this.title.minY) / 2) {
              ratioY = this.canvasRatio * this.verticalIncrement - (this.title.maxY - this.title.minY) / 2 
          }
          this.mainCanvas.ctx.beginPath();
          this.mainCanvas.ctx.strokeWidth = 2;
          this.drawSvg(this.states[j], ratioX, ratioY);
            
          const fillStroke = 1;
          this.strokeFillClosePath(fillStroke);
          if(duplicates === this.pageTransition.totalDuplications && j === duplicates - 1){
            this.easeTransitionAnimation(this.tick);
            return;
          }
        }
        this.tick ++;
      },

      /* 
      * Draw the second part of the page transition animation
      * We remove the duplications following the Bezier curve decrementation of the number x
      * 
      */
      pageTransitionEnd(data) {
        const duplicates = Math.trunc(Math.ceil(this.pageTransition.duplications));
        if (this.maxLength === 0) {
          this.maxLength = duplicates - 1;
          this.tick = Math.trunc(this.tick / 2) + (Math.trunc(this.tick / 2) % 2);
          this.displayedDuplicatas = this.sizes.length;
        }
        for (let j = 0; j < duplicates; j++ ) {
          const ratioX = this.sizes[j + this.sizes.length - duplicates];
          const ratioY = this.mainCanvas.el.height / 2 - (this.morphingSVG.visibleHeight / 2) - ((this.maxRatio + j) + this.sizes.length - duplicates + 1) * this.verticalIncrement - this.morphingSVG.visibleY;
          this.mainCanvas.ctx.beginPath();
          this.mainCanvas.ctx.strokeWidth = 2;
          this.drawSvg(this.states[j], ratioX, ratioY);
          // calculate alpha of duplicata
          const fillStroke = this.tick > 0 ? j * 0.7 / this.tick : j / 1;
          this.strokeFillClosePath(fillStroke);
          // if it is the last duplicata, set the vertical offset and set isComplete to get back to the first state
          if ( duplicates === 1){
            this.canvasRatio = this.pageTransition.totalDuplications;
            //mainCanvas.ctx.translate(0, -pageTransition.totalDuplications*verticalIncrement);
            this.pageTransition.isComplete = undefined;
            return;
          }
        }
        this.displayedDuplicatas = this.displayedDuplicatas > 2 ? Math.trunc(this.displayedDuplicatas * 0.9) : this.displayedDuplicatas--;
        this.tick--;
      },

      easeSlideProjectAnimation(totalTicks) {
        this.titleAnimation.isComplete = true;
        this.titleAnimation.totalDuplications = totalTicks;
        TweenMax.to(this.titleAnimation, 0.6, {
          duplications: 1,
          ease: CustomEase.create("custom", "0.77, 0, 0.175, 1"),
        });
      },

      easeTransitionAnimation(totalTicks) {
        this.pageTransition.initialIncrement = totalTicks;
        this.pageTransition.isComplete = true;
        TweenMax
        .to(this.pageTransition, 0.4, {
            duplications: 1,
            ease: CustomEase.create("custom", "0.77, 0, 0.175, 1"),
        });
      },

      morphTitle() {
        this.titleAnimation.totalDuplications = 70;
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
          .to(this.titleAnimation, 1, {
              duplications: this.titleAnimation.totalDuplications,
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

      checkTitleHover(mouse) {
        this.mouse.posX = mouse.posX;
        this.mouse.posY = mouse.posY;
        if (this.mouseOverProjectTitle()) {
          if (!this.$store.getters.homeBeenHovered) this.$store.dispatch('setHomeHover', true);
          if (this.title.alpha === 0.7) this.setTitleAlpha(1);
          document.body.style.cursor = 'pointer';
        } else {
          if (this.title.alpha === 1) this.setTitleAlpha(0.7);
          document.body.style.cursor = 'default';
        }
      },
      
      setTitleAlpha(value) {
        TweenMax.to(this.title, 0.3, {
          alpha: value
        });
      },

      mouseOverProjectTitle() {
        return this.mouse.posX >= this.title.minX + this.morphingSVG.x && 
               this.mouse.posX <= this.title.maxX + this.morphingSVG.x && 
               this.mouse.posY >= this.title.minY + this.morphingSVG.visibleY && 
               this.mouse.posY <= this.title.maxY
      },

      clickEvent() {
        if (this.mouseOverProjectTitle()) this.transitionToProject();
      },

      transitionToProject() {
        this.pageTransition.hasStarted = true;
        document.body.style.cursor = 'default';
        this.pageTransition.totalDuplications = Math.trunc((this.mainCanvas.el.height / 2 - (this.morphingSVG.visibleHeight / 2 * 0.30) - ((this.maxRatio + 1) * this.verticalIncrement) - this.morphingSVG.visibleY) / (this.verticalIncrement));
        if (this.pageTransition.isComplete === undefined) {
          this.maxLength = 0;
          this.tick = 0;
          this.states.length = 0;
          this.sizes.length = 0;
          this.pageTransition.duplications = 0;
          this.pageTransition.isComplete = false;

          TweenMax
          .to(this.pageTransition, 0.7, {
            duplications: this.pageTransition.totalDuplications,
            ease: CustomEase.create("custom", "0.77, 0, 0.175, 1"),
            delay: 0.05,
          })
        }
        setTimeout(() => {
          this.routeToProject();
        }, 2000);
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
            if (this.position === 'footer'){
              this.pageTransition.totalDuplications = Math.trunc((this.mainCanvas.el.height / 2 - (this.morphingSVG.visibleHeight / 2 * 0.30) - ((this.maxRatio + 1) * this.verticalIncrement) - this.morphingSVG.visibleY) / (this.verticalIncrement));
            }
            this.mainCanvas.ctx.translate(0, this.pageTransition.totalDuplications * (this.incrementDirection * this.verticalIncrement));
            // mainCanvas.ctx.setTransform(1,0,0,1,0, -canvasRatio * verticalIncrement);
        }, 100);
      },

      cancelEventListeners() {
        document.removeEventListener('click', this.clickEvent);
      }
    }
}
</script>