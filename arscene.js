AFRAME.registerComponent('buildings', {
  schema: {
    name: {type:'string'},
    metadata: {type:'string'},
  },
  init: function() {
    
    const $campus = document.getElementById('campus')
    const $year = document.getElementById('year')
    const $address = document.getElementById('address')
    const $maps = document.getElementById('maps')
    const $content = document.getElementById('content')
    const $closeContent = document.getElementById('close-content')

    const {object3D, sceneEl} = this.el
    let raf = null
    let rot = 0
    let startTimestamp = null
    let visibilityTimeoutHandle = null
    
    // Hide the image target until it is found
    object3D.visible = false

    const {name, year, address, maps, model, bgColor} = JSON.parse(this.data.metadata)

    const bgBox = document.createElement('a-box')
    // Image targets are 3:4 so the target is scaled to match
    bgBox.setAttribute('scale', '0.75 1 0.1')
    bgBox.setAttribute('material', 'shader:flat; color:'+ (bgColor ? bgColor:'#ccc'))
    bgBox.setAttribute('rotation', '0 0 90')
    this.el.appendChild(bgBox)

    const textData = {
      align: 'center',
      width: 0.7,
      wrapCount: 22,
      value: name,
      color: 'white',
    }

    // Instantiate the element with information about the building
    const buildingName = document.createElement('a-entity')
    buildingName.setAttribute('text', textData)
    buildingName.object3D.position.set(0, -0.15, 0.5)
    this.el.appendChild(buildingName)

    // Instantiate a second text object behind the first to achieve an shadow effect
    const textShadowEl = document.createElement('a-entity')
    textData.color = 'black'
    textShadowEl.setAttribute('text', textData)
    textShadowEl.object3D.position.set(0, -0.15, 0.49)
    this.el.appendChild(textShadowEl)

    const building = document.createElement('a-entity')
    building.setAttribute('scale', '0.025 0.025 0.025')
    building.setAttribute('gltf-model', '#'+model)
    building.object3D.position.z = .5;
    this.el.appendChild(building)

    building.addEventListener('click', e => {
      openBuildingDetail()
    })
    bgBox.addEventListener('click', e => {
      openBuildingDetail()
    })

    const openBuildingDetail = () => {
      $campus.innerHTML = name
      $year.innerHTML = 'Beroperasi: '+ (year ? year : '1996')
      $address.innerHTML = address ? address : 'Indonesia'
      $maps.setAttribute('href', maps ? maps : '#')
      $content.style.display = '';
      // animateCSS('#content', 'slideInUp')
      $closeContent.addEventListener('click', closeBuildingDetail)
    }

    const closeBuildingDetail = (e) => {
      if (e) e.preventDefault()
      // animateCSS('#content', 'slideOutDown', function() {
        $content.style.display = 'none' 
      // })
      $closeContent.removeEventListener('click', closeBuildingDetail)
    }

    const rotateBuilding = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      rot += Math.min((timestamp - startTimestamp) / 50, 5);
      building.setAttribute('rotation', '0 '+rot+' 0');
    }

    // showImage handles displaying and moving the virtual object to match the image
    const showImage = ({detail}) => {

      // Updating position/rotation/scale using object3D is more performant than setAttribute
      object3D.position.copy(detail.position)
  
      object3D.quaternion.copy(detail.rotation)
      object3D.scale.set(detail.scale, detail.scale, detail.scale)
      object3D.visible = true

      // clearTimeout(visibilityTimeoutHandle)
      // openBuildingDetail()

      raf = window.requestAnimationFrame(rotateBuilding);

      // Add tapTarget as a clickable object
      building.classList.add('cantap')
      bgBox.classList.add('cantap')
    }


    // hideImage handles hiding the virtual object when the image target is lost
    const hideImage = () => {
      object3D.visible = false

      window.cancelAnimationFrame(raf);

      // clearTimeout(visibilityTimeoutHandle)
      // visibilityTimeoutHandle = setTimeout(closeBuildingDetail, 2000)
      
      // Remove tapTarget from clickable objects
      building.classList.remove('cantap')
      bgBox.classList.remove('cantap')
    }

    // These events are routed and dispatched by xrextras-generate-image-targets
    this.el.addEventListener('xrimagefound', showImage)
    this.el.addEventListener('xrimageupdated', showImage)
    this.el.addEventListener('xrimagelost', hideImage)
  }
})

// xrextras-generate-image-targets uses this primitive to automatically populate multiple image targets
AFRAME.registerPrimitive('buildings-p', {
  defaultComponents: {
    buildings: {},
  },

  mappings: {
    name: 'buildings.name',
    metadata: 'buildings.metadata',
  }
})

function animateCSS(element, animationName, callback) {
    const node = document.querySelector(element)
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName)
        node.removeEventListener('animationend', handleAnimationEnd)

        if (typeof callback === 'function') callback()
    }

    node.addEventListener('animationend', handleAnimationEnd)
}

// loading
XR.addCameraPipelineModule({
  name: 'mycamerapipelinemodule',
  onStart: ({canvasWidth, canvasHeight}) => {
    alert('onstart!')
  },
})