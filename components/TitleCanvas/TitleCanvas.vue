<template>
    <div class="title-canvas">
        <span v-bind:class="{'title__next-project--hidden': position !== 'footer'}" class="title__next-project">next project</span>
        <canvas v-bind:class="{'home-project__title--bottom': position === 'footer'}" class="home-project__title"></canvas>
        <div class="home-svgs__container container">
            <svg v-for="(title, index) in titles"
                 :key="index"
                 class="home-svgs__project-title"
                 width="100%" height="100%"
                 :viewBox="title.svgTitleVB"
                 preserveAspectRatio="xMidYMid meet">
                    <path class="project" :d="title.svgTitlePath" />
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
import Scrollbar from 'smooth-scrollbar';
import { TweenMax, Power2 } from 'gsap';
import 'gsap/MorphSVGPlugin';
import 'gsap/CustomEase';

  export default {
    props: [
      'titles',
      'projectIndex',
      'viewport',
      'position',
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
        pixelRatio: '',
        shape: '',
        endShape: '',
        toBezier: '',
        responsiveRatio: '',
        svgWidth: '',
        svgHeight: '',
        states: [],
        sizes: [],
        titleIndex: this.position === 'footer' ? this.projectIndex : this.$store.getters.activeIndex,
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
      if (this.position !== 'header') {
        this.$parent.$on('mousemove', this.checkTitleHover)
      }
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
        // initialize canvas
        this.pixelRatio = window.devicePixelRatio;
        this.mainCanvas.el = document.createElement('canvas');
        this.mainCanvas.ctx = this.mainCanvas.el.getContext('2d');
        this.mainCanvas.width = this.viewport.w;
        this.mainCanvas.height = this.viewport.h;
        this.verticalIncrement = this.viewport.h / 220 * this.pixelRatio;
        this.incrementDirection = this.position === 'header' ? -1 : 1;
        this.projectsSvg = this.$el.querySelectorAll('.home-svgs__project-title');
        this.svgs = this.$el.querySelectorAll('svg');
        this.shape = this.$el.querySelector("#shape")
        this.endShape = this.$el.querySelectorAll(".project");
        this.responsiveRatio = this.defineResponsiveRatio();
        this.toBezier = MorphSVGPlugin.pathDataToRawBezier;
        this.morphingSVG.el = this.$el.querySelector('.morph-shape');
        this.shape.setAttribute('d', this.titles[this.titleIndex].svgTitlePath);
        this.morphingSVG.el.setAttribute('viewBox', this.titles[this.titleIndex].svgTitleVB);
        this.updateMorphingValues();
        // Subscribe to state project update
        let suscribe = this.$store.subscribe((mutation, state) => {
          if (mutation.type === 'SET_ACTIVEINDEX') {
            this.maxLength = 0;
            this.tick = 0;
            this.states.length = 0;
            this.sizes.length = 0;
            this.titleAnimation.isComplete = false;
            this.titleIndex =  this.$store.getters.activeIndex;
            this.morphTitle();
          }
        })
        this.setEventListeners();
        this.texture = PIXI.Texture.fromCanvas(this.mainCanvas.el);
        this.app = new PIXI.Application(this.viewport.w, this.viewport.h, {
          transparent: true,
          view: this.$el.querySelector('.home-project__title'),
          resolution: this.pixelRatio,
          autoResize: true,
        });
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);
        this.sprite = new PIXI.Sprite(this.texture);
        this.container.addChild(this.sprite);

        this.app.ticker.add(() => {
          this.render();
          this.texture.update();
        });
        this.setDisplay();
        if (this.position === 'header') {
          const svgVertical = ((this.morphingSVG.visibleHeight + this.morphingSVG.visibleY) / 3 * 2);
          this.pageTransition.totalDuplications = Math.ceil((this.mainCanvas.el.height / this.pixelRatio / 2  - svgVertical) / this.verticalIncrement) + 5;
          this.mainCanvas.ctx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
          // this.mainCanvas.ctx.translate(0, -this.verticalIncrement * this.pageTransition.totalDuplications);
        }
        if (this.position === 'footer') {
          // this.pageTransition.totalDuplications = Math.trunc((this.mainCanvas.el.height / this.pixelRatio / 2 - (this.morphingSVG.visibleHeight / 2 * 0.30) - ((this.maxRatio + 1) * this.verticalIncrement) - this.morphingSVG.visibleY) / (this.verticalIncrement));
          this.mainCanvas.ctx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
          // this.mainCanvas.ctx.translate(0, this.verticalIncrement * this.pageTransition.totalDuplications);
          this.shape.setAttribute('d', this.titles[this.titleIndex].svgTitlePath);
          this.morphingSVG.el.setAttribute('viewBox', this.titles[this.titleIndex].svgTitleVB);
        }
      },

      setEventListeners() {
        window.addEventListener('resize', this.resize);
        if(this.position === 'footer') {
          this.$el.querySelector('.home-project__title').addEventListener('click', this.clickEvent);
          // this.$el.querySelector('.home-project__title').addEventListener('mousemove', document.body.style.cursor.);          
        } else if (this.position !== 'header') {
          document.addEventListener('click', this.clickEvent);
        }
      },

      onUpdate() {
        // get the state of the morphed svg
        const data = this.shape.getAttribute("d");
        const fill = this.shape.style.fill;
        this.updateMorphingValues();

        // get width and height of morphed svg
        this.svgWidth = document.querySelector('#shape').getBoundingClientRect().width
        this.svgHeight = Math.floor(document.querySelector('#shape').getBoundingClientRect().height);
        this.mainCanvas.ctx.clearRect(0, 0, this.mainCanvas.el.width / this.pixelRatio, this.mainCanvas.el.height / this.pixelRatio);

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
          return
        }

        // if title animates back to home
        if (this.backHomeTransition.isComplete === true) {
          this.pageBackHomeTransitionEnd(data);
          return
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
        // this.svgWidth = document.querySelector('#shape').getBoundingClientRect().width
        // this.svgHeight = Math.floor(document.querySelector('#shape').getBoundingClientRect().height);
        const ratioX = ((this.mainCanvas.el.width / this.pixelRatio / 2) - (this.svgWidth / (this.mainCanvas.el.width / this.pixelRatio / this.morphingSVG.visibleWidth) / 2) - this.morphingSVG.visibleX);
        let ratioY;
        if (this.position === 'header') {
          ratioY = -((this.morphingSVG.visibleHeight + this.morphingSVG.visibleY) / 3);
        } else if (this.position === 'footer') {
          ratioY = this.mainCanvas.el.height / this.pixelRatio - ((this.morphingSVG.visibleHeight + this.morphingSVG.visibleY) * 2 / 3);
        } else {
          ratioY = this.mainCanvas.el.height / this.pixelRatio / 2 - (this.morphingSVG.visibleHeight / 2) - ((this.pageTransition.totalDuplications - 1) + this.sizes.length - this.pageTransition.totalDuplications + 1) * this.verticalIncrement - this.morphingSVG.visibleY;
        }
        // define box position of the title for the hover
        this.title.minX = ratioX;
        this.title.maxX = this.title.minX + this.morphingSVG.visibleWidth;
        this.title.minY = this.position === 'footer' ? ratioY : ratioY + (this.canvasRatio * this.verticalIncrement);
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
          this.sizes[i] = ((this.mainCanvas.el.width / this.pixelRatio / 2) - this.svgWidth / (this.mainCanvas.el.width / this.pixelRatio / this.morphingSVG.visibleWidth) / 2 - this.morphingSVG.visibleX)
        }
        for (let j = 0; j < duplicates; j++ ) {
          const ratioX = this.sizes[j];
          const ratioY = this.mainCanvas.el.height / this.pixelRatio / 2 - (this.morphingSVG.visibleHeight / 2) - (j * this.verticalIncrement) - this.morphingSVG.visibleY;
          if (duplicates === this.titleAnimation.totalDuplications) {
            const ratioY = (this.morphingSVG.visibleHeight + this.morphingSVG.visibleY) / 3;
          }
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
          const ratioY = this.mainCanvas.el.height / this.pixelRatio / 2 - (this.morphingSVG.visibleHeight / 2) - (j * this.verticalIncrement) - this.morphingSVG.visibleY;;
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
            this.sizes[i] = ((this.mainCanvas.el.width / this.pixelRatio / 2) - this.svgWidth / (this.mainCanvas.el.width / this.pixelRatio / (this.morphingSVG.visibleWidth)) / 2 - this.morphingSVG.visibleX);
          }
        }
        for (let j = 0; j <= duplicates; j++) {
          const ratioX = this.sizes[j];
          let ratioY
          if (this.position === 'footer'){
            ratioY = this.mainCanvas.el.height / this.pixelRatio - ((this.morphingSVG.visibleHeight + this.morphingSVG.visibleY) * 2 / 3) - (j * this.verticalIncrement);
          } else {
            ratioY = this.mainCanvas.el.height / this.pixelRatio / 2 - (this.morphingSVG.visibleHeight / 2) - (j * this.verticalIncrement) - this.morphingSVG.visibleY;
          }
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
        const duplicates = Math.trunc(Math.ceil(this.pageTransition.duplications)) === 0 ? 1 : Math.trunc(Math.ceil(this.pageTransition.duplications));
        if (this.maxLength === 0) {
          this.maxLength = duplicates - 1;
          this.tick = Math.trunc(this.tick / 2) + (Math.trunc(this.tick / 2) % 2);
          this.displayedDuplicatas = this.sizes.length;
        }
        for (let j = 0; j < duplicates; j++ ) {          
          const ratioX = this.sizes[j + this.sizes.length - duplicates];
          let ratioY;
          if (this.position === 'footer') {
            ratioY = this.mainCanvas.el.height / this.pixelRatio - (this.morphingSVG.visibleHeight + this.morphingSVG.visibleY * 2 / 3) - (j + this.sizes.length - duplicates + 1) * this.verticalIncrement;
          } else {
            ratioY = this.mainCanvas.el.height / this.pixelRatio / 2 - (this.morphingSVG.visibleHeight / 2) - (j + this.sizes.length - duplicates + 1) * this.verticalIncrement - this.morphingSVG.visibleY;
          }
          this.mainCanvas.ctx.beginPath();
          this.mainCanvas.ctx.strokeWidth = 2;
          this.drawSvg(this.states[j], ratioX, ratioY);
          // calculate alpha of duplicata
          const fillStroke = this.tick > 0 ? j * 0.7 / this.tick : j / 1;
          this.strokeFillClosePath(fillStroke);
          // if it is the last duplicata, set the vertical offset and set isComplete to get back to the first state
          if ( duplicates === 1){
            // this.canvasRatio = this.pageTransition.totalDuplications;
            //mainCanvas.ctx.translate(0, -pageTransition.totalDuplications*verticalIncrement);
            // this.pageTransition.isComplete = undefined;
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
        .to(this.pageTransition, 0.6, {
          duplications: 1,
          ease: CustomEase.create("custom", "0.77, 0, 0.175, 1"),
        });
      },

      morphTitle() {      
        this.titleAnimation.totalDuplications = 70 / this.pixelRatio;
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
          if (this.title.alpha === 0.7) this.setTitleAlpha(1);
          document.body.style.cursor = 'pointer';
          if (!this.$store.getters.homeBeenHovered) this.$store.dispatch('setHomeHover', true);
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
        const scrollbars = Scrollbar.getAll();
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
        if (this.pageTransition.isComplete === undefined) {
          // 
          const displacementRatio = this.position === 'footer' ? 1 : 2;
          
          // * Start with defining the point to reach at the end of animation
          // **For the project to project transition, its the top of the canvas minus one third of the active title
          // 0 - (morphingSVG.visibleHeight / 3) - (morphingSVG.visibleY / 3)
          // * Get the distance between the final point and the starting point
          // ** For the project to project transition, it is the bottom of the canvas plus one third of the active title
          // this.mainCanvas.el.height + (this.morphingSvg.visibleHeight / 3) + (this.morphinSvg.visibleY / 3)
          // * Divide the distance by the value of the increment to get the number of duplications
          // (this.mainCanvas.el.height / this.pixelRatio - morphSvgVisibleVertical) / this.verticalIncrement

          const svgVertical = ((this.morphingSVG.visibleHeight + this.morphingSVG.visibleY) / 3 * 2);
          this.pageTransition.totalDuplications = Math.ceil((this.mainCanvas.el.height / this.pixelRatio - svgVertical) / this.verticalIncrement);
          this.maxLength = 0;
          this.tick = 0;
          this.states.length = 0;
          this.sizes.length = 0;
          this.pageTransition.duplications = 0;
          this.tl
          .to(document.querySelectorAll('.work__element'), 0.3, {
            opacity: 0,
            delay: 0.1,
          })
          .to(this.$el.querySelector('.title__next-project'), 0.2, {
            opacity: 0,
          });

          setTimeout(() => {
            this.pageTransition.isComplete = false;
            TweenMax
            .to(this.pageTransition, 0.7, {
              duplications: this.pageTransition.totalDuplications,
              ease: CustomEase.create("custom", "0.77, 0, 0.175, 1"),
              delay: 0.05,
            });
          }, 500);
        }
        setTimeout(() => {
          this.updateActiveProject();
          this.routeToProject();
        }, 2000);
      },

      routeToProject() {
        this.$router.push(`/work/${this.titles[this.titleIndex].name}`);
        if (this.position === 'footer') {
          const value = this.setIndex(this.projectIndex);
          this.$store.dispatch('setActiveIndex', value);
        }
      },
      
      defineResponsiveRatio() {
        const largestSvg = Object.keys(this.projectsSvg).reduce((a, b) => this.projectsSvg[a].viewBox.baseVal.width > this.projectsSvg[b].viewBox.baseVal.width ? a : b);
        return this.viewport.w * 0.8 < this.projectsSvg[largestSvg].viewBox.baseVal.width ? this.viewport.w * 0.8 / this.projectsSvg[largestSvg].viewBox.baseVal.width : 1;
      },

      setDisplay() {
        this.mainCanvas.el.width  = this.viewport.w * this.pixelRatio;
        this.mainCanvas.el.height = this.viewport.h * this.pixelRatio;
        this.mainCanvas.ctx.scale(this.pixelRatio, this.pixelRatio);
      },

      /*
      * The main animation
      */
      render() {
        // this.mainCanvas.ctx.clearRect(0, 0, this.mainCanvas.el.width / this.pixelRatio, this.mainCanvas.el.height / this.pixelRatio);
        this.onUpdate();
      },

      resize() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() =>  {
          // Run code here, resizing has "stopped"
          this.viewport.w = window.innerWidth;
          this.viewport.h = window.innerHeight;
          this.mainCanvas.width = this.viewport.w;
          this.mainCanvas.height = this.position === 'footer' ? this.viewport.h * this.pixelRatio / 2 :   this.viewport.h;
          this.setDisplay();
          this.verticalIncrement = this.viewport.h / (220 / this.pixelRatio);
          this.responsiveRatio = this.defineResponsiveRatio();

          this.mainCanvas.ctx.setTransform(this.pixelRatio,0,0,this.pixelRatio,0,0);
          this.updateMorphingValues();

          this.mainCanvas.ctx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
          if (this.position === 'header') {            
            this.pageTransition.totalDuplications = Math.trunc((this.mainCanvas.el.height / this.pixelRatio / 2 - (this.morphingSVG.visibleHeight / 2 * 0.30) - this.verticalIncrement - this.morphingSVG.visibleY) / (this.verticalIncrement));
            this.mainCanvas.ctx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
            this.mainCanvas.ctx.translate(0, -this.verticalIncrement*this.pageTransition.totalDuplications);
          }
          if (this.position === 'footer') {
            this.pageTransition.totalDuplications = Math.trunc((this.mainCanvas.el.height / this.pixelRatio / 2 - (this.morphingSVG.visibleHeight / 2 * 0.30) - this.verticalIncrement - this.morphingSVG.visibleY) / (this.verticalIncrement));
            this.mainCanvas.ctx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
            this.mainCanvas.ctx.translate(0, this.verticalIncrement * this.pageTransition.totalDuplications);
            this.shape.setAttribute('d', this.titles[this.titleIndex].svgTitlePath);
            this.morphingSVG.el.setAttribute('viewBox', this.titles[this.titleIndex].svgTitleVB);
          }
        }, 100);
      },
      cancelEventListeners() {
        document.removeEventListener('click', this.clickEvent);
      },
      updateActiveProject() {
      },
      setIndex(index) {
        if (index > this.titles.length - 1) {
            index = 0
        }
        if (index < 0) {
            index = this.titles.length;
        }
        return index;
      }
    }
}
</script>
