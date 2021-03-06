<template>
  <div v-bind:class="{'visible': visible}" class="title-canvas">
    <span v-bind:class="{'title__next-project--hidden': position !== 'footer'}" class="title__next-project">next project</span>
    <!-- <button class="back-home">back home</button> -->
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
      'visible',
      'titles',
      'projectIndex',
      'viewport',
      'canvasPos',
    ],
    data() {
      return {
        mainCanvas: {
          el: '',
          ctx: '',
          width: '',
          height: '',
        },
        position: this.canvasPos,
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
        titleIndex: this.canvasPos === 'footer' ? this.projectIndex : this.$store.getters.activeIndex,
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
          alpha: this.position === 'header' ? 1 : 0.7,
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

      let suscribe = this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'TRIGGER_TRANSITION_EVENT') {
          this.transitionToProject();
        }
        if (mutation.type === 'TRIGGER_BACK_TO_CENTER_EVENT') {
          const scrollbars = Scrollbar.getAll();
          const titleCanvas = document.querySelector('.title-canvas');

          titleCanvas.style.top = 0;
          titleCanvas.style.bottom = 'auto';

          this.position = 'header';

          if (scrollbars.length > 0) {
            if (scrollbars[0].scrollTop > 0) {
              scrollbars[0].scrollTo(0, 0, 700, {
                callback: this.backhome,
              });
            } else {
              this.backhome();
            }
          }
        }
        if (mutation.type === 'TRIGGER_CLICK_TO_CASE_EVENT') {
          this.transitionToProject();
        }
      });
    },
    mounted() {
      this.init();
    },
    beforeDestroy() {
      this.cancelEventListeners();
      cancelAnimationFrame(this.req);
    },
    watch: {
      visible: (val) => {
        this.isVisible = val;
      },
      canvasPos: function(val) {
        this.position = val;
        this.title.alpha = this.position === 'header' ? 1 : 0.7;
        this.cancelEventListeners();
        this.setEventListeners();
        this.setTransitionDuplications();

        if (this.position !== 'header') {
          this.$parent.$on('mousemove', this.checkTitleHover)
        }
      },
      projectIndex: function(val) {
        this.titleIndex = val === undefined ? this.$store.getters.activeIndex : val;
        this.setShape();
      }
    },
    methods: {
      init() {
        this.backhomebt = this.$el.querySelector('.back-home');
        // initialize canvas
        this.pixelRatio = this.$store.getters.pixelRatio;
        this.mainCanvas.el = document.createElement('canvas');
        this.mainCanvas.ctx = this.mainCanvas.el.getContext('2d');
        this.mainCanvas.width = this.viewport.w;
        this.mainCanvas.height = this.viewport.h;
        this.verticalIncrement = this.viewport.h / (220 / this.pixelRatio);
        this.incrementDirection = this.position === 'header' ? -1 : 1;
        this.projectsSvg = this.$el.querySelectorAll('.home-svgs__project-title');
        this.svgs = this.$el.querySelectorAll('svg');
        this.endShape = this.$el.querySelectorAll(".project");
        this.responsiveRatio = this.defineResponsiveRatio();
        this.toBezier = MorphSVGPlugin.pathDataToRawBezier;
        this.setShape();
        this.updateMorphingValues();
        // Subscribe to state project update
        // TODO : Remove this because too much update functions
        let suscribe = this.$store.subscribe((mutation, state) => {
          if (mutation.type === 'SET_ACTIVEINDEX') {
            if (this.$route.name === 'index') {
              this.maxLength = 0;
              this.tick = 0;
              this.states.length = 0;
              this.sizes.length = 0;
              this.titleAnimation.isComplete = false;
              this.titleIndex =  this.$store.getters.activeIndex;
              this.morphTitle();
            }
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
          if (this.$route.name !== 'about'){
            this.render();
            this.texture.update();
          }
        });
        this.setDisplay();
        this.setTransitionDuplications();
        if (this.position === 'footer') {
          this.mainCanvas.ctx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
          this.shape.setAttribute('d', this.titles[this.titleIndex].svgTitlePath);
          this.morphingSVG.el.setAttribute('viewBox', this.titles[this.titleIndex].svgTitleVB);
        }
      },

      setShape() {
        this.shape = this.$el.querySelector("#shape")
        this.shape.setAttribute('d', this.titles[this.titleIndex].svgTitlePath);

        this.morphingSVG.el = this.$el.querySelector('.morph-shape');
        this.morphingSVG.el.setAttribute('viewBox', this.titles[this.titleIndex].svgTitleVB);
      },

      setEventListeners() {
        // this.backhomebt.addEventListener('click', this.backhome);
        window.addEventListener('resize', this.resize);
        if(this.position === 'footer') {
          document.addEventListener('click', this.clickEvent);
          // this.$el.querySelector('.home-project__title').addEventListener('mousemove', document.body.style.cursor.);
        } else if (this.position !== 'header' && this.$route.path.search('/work/') === -1) {
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
        this.mainCanvas.ctx.clearRect(0, 0, this.mainCanvas.el.width * 2, this.mainCanvas.el.height * 2);

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
            (this.pageTransition.isComplete === undefined &&
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
          ratioY = -(((this.morphingSVG.visibleHeight) / 3) + (this.morphingSVG.visibleY));
        } else if (this.position === 'footer') {
          ratioY = this.mainCanvas.el.height / this.pixelRatio - ((this.morphingSVG.visibleHeight + this.morphingSVG.visibleY) * 2 / 3);
        } else {
          ratioY = this.mainCanvas.el.height / this.pixelRatio / 2 - (this.morphingSVG.visibleHeight / 2) - ((this.pageTransition.totalDuplications - 1) + this.sizes.length - this.pageTransition.totalDuplications + 1) * this.verticalIncrement - this.morphingSVG.visibleY;
        }
        // define box position of the title for the hover
        this.title.minX = ratioX;
        this.title.maxX = this.title.minX + this.morphingSVG.visibleWidth;
        this.title.minY = this.position === 'footer' ? ratioY : ratioY + (this.canvasRatio * this.verticalIncrement);
        this.title.maxY = this.title.minY + this.morphingSVG.visibleHeight + this.morphingSVG.visibleY;
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
            this.setTransitionDuplications();
            return;
          }
        }
        this.displayedDuplicatas--;
        this.tick--;
      },

      pageBackHomeTransitionStart(data) {
        const duplicates = Math.trunc(Math.ceil(this.backHomeTransition.duplications));
        if (this.tick === 0) {
          for (let i = 0; i < this.backHomeTransition.totalDuplications; i++){
            this.states[i] = this.toBezier(data);
            this.sizes[i] = ((this.mainCanvas.el.width / this.pixelRatio / 2) - this.svgWidth / (this.mainCanvas.el.width / this.pixelRatio / (this.morphingSVG.visibleWidth)) / 2 - this.morphingSVG.visibleX);
          }
        }
        for (let j = 0; j < duplicates; j++) {
          const ratioX = this.sizes[j];
          let ratioY = -this.morphingSVG.visibleHeight / 3 - this.morphingSVG.visibleY + (j * this.verticalIncrement);
          if (ratioY >= this.mainCanvas.el.height / this.pixelRatio / 2 - (this.morphingSVG.visibleHeight / 2) - this.morphingSVG.visibleY) {
            ratioY =  this.mainCanvas.el.height / this.pixelRatio / 2 - (this.morphingSVG.visibleHeight / 2) - this.morphingSVG.visibleY;
          }
          this.mainCanvas.ctx.beginPath();
          this.drawSvg(this.states[j], ratioX, ratioY);
          const fillStroke = 1;
          this.strokeFillClosePath(fillStroke);
          if(duplicates === this.backHomeTransition.totalDuplications && j === duplicates - 1){
            this.backHomeTriggerEnd(this.tick);
            return;
          }
        }
        this.tick ++;
      },

      pageBackHomeTransitionEnd(data) {
        const duplicates = Math.trunc(Math.ceil(this.backHomeTransition.duplications)) === 0 ? 1 : Math.trunc(Math.ceil(this.backHomeTransition.duplications));
        if (this.maxLength === 0) {
          this.maxLength = duplicates - 1;
          this.tick = Math.trunc(this.tick / 2) + (Math.trunc(this.tick / 2) % 2);
          this.displayedDuplicatas = this.sizes.length;
        }
        let hasReachedCenter = false;
        for (let j = 0; j < duplicates; j++ ) {
          const ratioX = this.sizes[j + this.sizes.length - duplicates];
          let ratioY = -this.morphingSVG.visibleHeight / 3 - this.morphingSVG.visibleY + (j + this.sizes.length - duplicates) * this.verticalIncrement;
          if (ratioY >= this.mainCanvas.el.height / this.pixelRatio / 2 - (this.morphingSVG.visibleHeight / 2) - this.morphingSVG.visibleY) {
            ratioY = this.mainCanvas.el.height / this.pixelRatio / 2 - (this.morphingSVG.visibleHeight / 2) - this.morphingSVG.visibleY;
            if (hasReachedCenter && j !== 1) {
              continue;
            } else {
              hasReachedCenter = true;
            }
          }
          this.mainCanvas.ctx.beginPath();
          this.mainCanvas.ctx.strokeWidth = 2;
          this.drawSvg(this.states[j], ratioX, ratioY);
          const fillStroke = this.tick > 0 ? j + 1 * 0.7 / this.tick : j + 1 / 1;
          this.strokeFillClosePath(fillStroke);
          // if it is the last duplicata, set the vertical offset and set isComplete to get back to the first state
          if (duplicates === 1){
            this.sizes.length = 0;
            this.states.length = 0;
            this.position = 'center';
            this.setTransitionDuplications();
            this.backHomeTransition.isComplete = undefined;
            return;
          }
        }
      },

      /*
      * Draw the first part of the page transition animation
      * The title duplicates following the Bezier curve incrementation of the number x
      *
      */
      pageTransitionStart(data) {
        const duplicates = Math.ceil(this.pageTransition.duplications);
        if (this.tick === 0) {
          for (let i = 0; i < this.pageTransition.totalDuplications; i++){
            this.states[i] = this.toBezier(data);
            this.sizes[i] = ((this.mainCanvas.el.width / this.pixelRatio / 2) - this.svgWidth / (this.mainCanvas.el.width / this.pixelRatio / (this.morphingSVG.visibleWidth)) / 2 - this.morphingSVG.visibleX);
          }
        }
        let hasReachedTop = false;
        for (let j = 0; j <= duplicates; j++) {
          const ratioX = this.sizes[j];
          let ratioY
          if (this.position === 'footer'){
            ratioY = this.mainCanvas.el.height / this.pixelRatio - ((this.morphingSVG.visibleHeight) * 2 / 3) + this.morphingSVG.visibleY - (j * this.verticalIncrement);
          } else {
            ratioY = this.mainCanvas.el.height / this.pixelRatio / 2 - (this.morphingSVG.visibleHeight / 2) - (this.morphingSVG.visibleY) - (j * this.verticalIncrement);
          }
          if (ratioY <=  -(((this.morphingSVG.visibleHeight) / 3) + (this.morphingSVG.visibleY))) {
            if (hasReachedTop && duplicates !== this.pageTransition.totalDuplications) {
              continue;
            } else {
              ratioY =  -(((this.morphingSVG.visibleHeight) / 3) + (this.morphingSVG.visibleY));
              hasReachedTop = true;
            }
          }
          this.mainCanvas.ctx.beginPath();
          this.mainCanvas.ctx.strokeWidth = 2;
          this.drawSvg(this.states[j], ratioX, ratioY);
          const fillStroke = (j + 1) / (duplicates + 1);
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
        const duplicates = Math.ceil(this.pageTransition.duplications);
        if (this.maxLength === 0) {
          this.maxLength = duplicates - 1;
          this.tick = Math.trunc(this.tick / 2) + (Math.trunc(this.tick / 2) % 2);
          this.displayedDuplicatas = this.sizes.length;
        }
        let hasReachedTop = false;
        for (let j = 0; j < duplicates; j++ ) {
          const ratioX = this.sizes[j + this.sizes.length - duplicates];
          let ratioY;
          if (this.position === 'footer') {
            ratioY = this.mainCanvas.el.height / this.pixelRatio - (this.morphingSVG.visibleHeight * 2 / 3) - this.morphingSVG.visibleY - (j + this.sizes.length - duplicates) * this.verticalIncrement;
          } else {
            ratioY = this.mainCanvas.el.height / this.pixelRatio / 2 - (this.morphingSVG.visibleHeight / 2) - (this.morphingSVG.visibleHeight / 6 + this.morphingSVG.visibleY) - (j + this.sizes.length - duplicates) * this.verticalIncrement;
            // ratioY = this.mainCanvas.el.height / this.pixelRatio / 2 - (this.morphingSVG.visibleHeight / 2) - (this.morphingSVG.visibleHeight / 6 + this.morphingSVG.visibleY) - (j * this.verticalIncrement);

          }

          if (ratioY <=  -(((this.morphingSVG.visibleHeight) / 3) + (this.morphingSVG.visibleY))) {
            if (hasReachedTop && j !== 1) {
              continue;
            } else {
              ratioY =  -(((this.morphingSVG.visibleHeight) / 3) + (this.morphingSVG.visibleY));
              hasReachedTop = true;
            }
          }
          this.mainCanvas.ctx.beginPath();
          this.mainCanvas.ctx.strokeWidth = 2;
          this.drawSvg(this.states[j], ratioX, ratioY);
          // calculate alpha of duplicata
          const fillStroke = (j + 1) / duplicates;
          this.strokeFillClosePath(fillStroke);
          // if it is the last duplicata, set the vertical offset and set isComplete to get back to the first state
          if (duplicates === 1){
            // this.canvasRatio = this.pageTransition.totalDuplications;
            //mainCanvas.ctx.translate(0, -pageTransition.totalDuplications*verticalIncrement);
            this.pageTransition.isComplete = undefined;
            this.position = 'header';
            const titleCanvas = document.querySelector('.title-canvas');
            titleCanvas.style.top = 0;
            titleCanvas.style.bottom = 'auto';
            const scrollbars = Scrollbar.getAll();
            if (scrollbars.length > 0) scrollbars[0].scrollTop = 0;
            return;
          }
        }
        this.displayedDuplicatas = this.displayedDuplicatas > 2 ? Math.trunc(this.displayedDuplicatas * 0.9) : this.displayedDuplicatas--;
        this.tick--;
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
        if (this.position === 'header') return;
        this.mouse.posX = mouse.posX;
        this.mouse.posY = mouse.posY;

        if (this.mouseOverProjectTitle()) {
          if (this.title.alpha === 0.7) this.setTitleAlpha(1);
          document.body.style.cursor = 'pointer';
          if (!this.$store.getters.homeBeenHovered && this.$route.path.search('/work/') == -1) this.$store.dispatch('setHomeHover', true);
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
        this.title.alpha = 1;
        if (this.pageTransition.isComplete === undefined) {
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
            .to(this.pageTransition, 0.8, {
              duplications: this.pageTransition.totalDuplications,
              ease: CustomEase.create("custom", "0.77, 0, 0.175, 1"),
              delay: 0.05,
            });
          }, 50);
        }
        setTimeout(() => {
          this.routeToProject();
        }, 1500);
      },

      backhome() {
        this.backHomeTransition.isComplete = false;
        this.maxLength = 0;
        this.tick = 0;
        this.states.length = 0;
        this.sizes.length = 0;
        this.backHomeTransition.duplications = 0;
        this.tl
        .to(document.querySelector('.work'), 0.3, {
          opacity: 0,
          delay: 0.1,
        })
        TweenMax
        .to(this.backHomeTransition, 0.6, {
          duplications: this.backHomeTransition.totalDuplications,
          ease: CustomEase.create("custom", "0.77, 0, 0.175, 1"),
        });
      },

      backHomeTriggerEnd(totalTicks) {
        this.backHomeTransition.isComplete = true;
        TweenMax.to(this.backHomeTransition, 0.6, {
          duplications: 1,
          ease: CustomEase.create("custom", "0.77, 0, 0.175, 1"),
        });
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

      routeToProject() {
        this.$router.push(`/work/${this.titles[this.titleIndex].name}`);

        // force opacity on footer
        this.$el.querySelector('.title__next-project').style.opacity = 1;

        if (this.canvasPos === 'footer') {
          const value = this.setIndex(this.projectIndex);
          this.$store.dispatch('setActiveIndex', value);
        }
      },

      routeToHome() {
        this.$router.push(`/`);
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

      setTransitionDuplications() {
        // * Start with defining the point to reach at the end of animation
        // **For the project to project transition, its the top of the canvas minus one third of the active title
        // 0 - (morphingSVG.visibleHeight / 3) - (morphingSVG.visibleY / 3)
        // * Get the distance between the final point and the starting point
        // ** For the project to project transition, it is the bottom of the canvas plus one third of the active title
        // this.mainCanvas.el.height + (this.morphingSvg.visibleHeight / 3) + (this.morphinSvg.visibleY / 3)
        // * Divide the distance by the value of the increment to get the number of duplications
        // (this.mainCanvas.el.height / this.pixelRatio - morphSvgVisibleVertical) / this.verticalIncrement
        let svgVertical;
        if (this.position === 'center'){
          svgVertical = (this.morphingSVG.visibleHeight) / 6 + this.morphingSVG.visibleY;
          this.pageTransition.totalDuplications = Math.ceil(((this.mainCanvas.el.height / this.pixelRatio / 2) - svgVertical) / this.verticalIncrement);
        } else {
          svgVertical = ((this.morphingSVG.visibleHeight + this.morphingSVG.visibleY) / 3 * 2);
          this.pageTransition.totalDuplications = Math.ceil((((this.mainCanvas.el.height / this.pixelRatio) - (this.morphingSVG.visibleHeight + this.morphingSVG.visibleY) / 3)) / this.verticalIncrement);
        }
        this.backHomeTransition.totalDuplications = Math.ceil(((this.mainCanvas.el.height / this.pixelRatio / 2)) / this.verticalIncrement);
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

          this.mainCanvas.ctx.clearRect(0, 0, this.mainCanvas.el.width, this.mainCanvas.el.height);
          if (this.position === 'header') {
            this.pageTransition.totalDuplications = Math.trunc((this.mainCanvas.el.height / this.pixelRatio / 2 - (this.morphingSVG.visibleHeight / 2 * 0.30) - this.verticalIncrement - this.morphingSVG.visibleY) / (this.verticalIncrement));
            this.mainCanvas.ctx.clearRect(0, 0, this.mainCanvas.el.width, this.mainCanvas.height);
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
