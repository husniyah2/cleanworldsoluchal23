import Phaser from '../lib/phaser.js'
import Carrot from '../game/Carrot.js'
export default class Game extends Phaser.Scene 
  
  {
  //export default class Carrot extends Phaser.Physics.Arcade.Sprite {

   player 
   
   platforms

   cursors

   carrots

   carrotsCollected = 0

   carrotsCollectedText
   
 constructor()
 {
 super('game')
 }
init()
{
   this.carrotsCollected = 0
}
 preload()
  {
    this.load.image('background', 'assets/bg_layer1.png')
 // load the platform image
    this.load.image('platform', 'assets/ground_grass.png')
    this.load.image('trashcan', 'assets/realwasteicon.png')
    this.load.image('trashcan1', 'assets/realwasteicon.png')
    this.load.image('carrot', 'assets/carrot.png')
    this.load.audio('jump', 'assets/sfx/phaseJump1.ogg')
    this.cursors = this.input.keyboard.createCursorKeys()

 }

 create()
 {
    this.add.image(240, 320, 'background')
      .setScrollFactor(1, 0)

    // add a platform image in the middle
    this.platforms = this.physics.add.staticGroup()
    // then create 5 platforms from the group
    for (let i = 0; i < 5; ++i)
   {
      const x = Phaser.Math.Between(80, 400)
      const y = 150 * i

      //** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = this.platforms.create(x, y, 'platform')
      platform.scale = 0.5

      //** @type {Phaser.Physics.Arcade.StaticBody} */
      const body = platform.body
      body.updateFromGameObject()
   }
      // create a bunny sprite
   this.player = this.physics.add.sprite(240, 320, 'trashcan')
      .setScale(0.5)

       //adding a collider
   this.physics.add.collider(this.platforms, this.player)
   
   //checking collision
   this.player.body.checkCollision.up = false
   this.player.body.checkCollision.left = false
   this.player.body.checkCollision.right = false

   //following the bunny
   this.cameras.main.startFollow(this.player)

   //camera dead zones
   this.cameras.main.startFollow(this.player)

   // set the horizontal dead zone to 1.5x game width
   this.cameras.main.setDeadzone(this.scale.width * 1.5)

   // create a carrot
   this.carrots = this.physics.add.group({
    classType: Carrot
    })
   
    this.carrots.get(240, 320, 'carrot')
    
   //add collider
   this.physics.add.collider(this.platforms, this.carrots)
   
   // formatted this way to make it easier to read
   this.physics.add.overlap(this.player, this.carrots, this.handleCollectCarrot, undefined, this)

   //adding score text
   const style = { color: '#000', fontSize: 24 }
 this.carrotsCollectedText = this.add.text(240, 10, 'Carrots: 0', { color: '#000', fontSize: 24 })
			.setScrollFactor(0)
			.setOrigin(0.5, 0)
   }

update(t, dt){

   this.platforms.children.iterate(child => {
      // @type {Phaser.Physics.Arcade.Sprite} */
       const platform = child
      
       const scrollY = this.cameras.main.scrollY
       if (platform.y >= scrollY + 700)
       {
         platform.y = scrollY - Phaser.Math.Between(50, 100)
         platform.body.updateFromGameObject()

         //creat a carrot above the platform being reused
         this.addCarrotAbove(platform)
       }
      })

   //taking platforms from bottom to the top
   this.platforms.children.iterate(child => {
      //** @type {Phaser.Physics.Arcade.Sprite} */ 
       const platform = child

       const scrollY = this.cameras.main.scrollY
       if (platform.y >= scrollY + 700)
       {
          platform.y = scrollY - Phaser.Math.Between(50, 100)
          platform.body.updateFromGameObject()
       }
      })

      // find out from Arcade Physics if the player's physics body
      // is touching something below it
      const touchingDown = this.player.body.touching.down

		if (touchingDown)
		{
			this.player.setVelocityY(-350)
         this.player.setTexture('trashcan1')
         // play jump sound
       this.sound.play('jump')
		}
      const vy = this.player.body.velocity.y
      
      if (vy > 0 && this.player.texture.key !== 'trashcan')
       {
       // switch back to jump when falling
       this.player.setTexture('trashcan')
       }

      // left and right input logic
      if (this.cursors.left.isDown && !touchingDown)
      {
         this.player.setVelocityX(-200)
      }
      else if (this.cursors.right.isDown && !touchingDown)
      {
            this.player.setVelocityX(200)
 }
 else
 {
   // stop movement if not left or right
    this.player.setVelocityX(0)
 }

 this.horizontalWrap(this.player)
   
 const bottomPlatform = this.findBottomMostPlatform()
  if (this.player.y > bottomPlatform.y + 200)
  {
   this.scene.start('game-over')
  }
}
 horizontalWrap(sprite)
  {
  const halfWidth = sprite.displayWidth * 0.5
  const gameWidth = this.scale.width
  if (sprite.x < -halfWidth)
  {
  sprite.x = gameWidth + halfWidth
  }
  else if (sprite.x > gameWidth + halfWidth)
  {
  sprite.x = -halfWidth
  }
}
addCarrotAbove(sprite) 
   {
   const y = sprite.y - sprite.displayHeight
  
   //@type {Phaser.Physics.Arcade.Sprite} */
   const carrot = this.carrots.get(sprite.x, y, 'carrot')
  
   // set active and visible
   carrot.setActive(true)
   carrot.setVisible(true)
   
   this.add.existing(carrot)
  
   // update the physics body size
   carrot.body.setSize(carrot.width, carrot.height)
  
   // make sure body is enabed in the physics world
  this.physics.world.enable(carrot)
   
   return carrot
   }

  /**
// *@param {Phaser.Physics.Arcade.Sprite} player
//  *@param {Carrot} carrot
 */
handleCollectCarrot(player, carrot)
    {
    // hide from display
    this.carrots.killAndHide(carrot)
   
    // disable from physics world
    this.physics.world.disableBody(carrot.body)

    // increment by 1
    this.carrotsCollected++

   // create new text value and set it
   this.carrotsCollectedText.text = `Trash Collected: ${this.carrotsCollected}`
    }
findBottomMostPlatform()
    {
     const platforms = this.platforms.getChildren()
     let bottomPlatform = platforms[0]
    
     for (let i = 1; i < platforms.length; ++i)
     {
     const platform = platforms[i]
    
     // discard any platforms that are above current
     if (platform.y < bottomPlatform.y)
     {
     continue
     }
    
     bottomPlatform = platform
     }
     return bottomPlatform
      }
  
   }
